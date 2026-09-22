from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.models.user import User, UserRole, VendorProfile
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse
from app.schemas.user import UserOut


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)

    def signup(self, payload: SignupRequest) -> TokenResponse:
        if self.users.get_by_username(payload.username):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")
        if payload.email and self.users.get_by_email(payload.email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        if payload.mobile and self.users.get_by_mobile(payload.mobile):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Mobile number already registered")

        if payload.role == UserRole.VENDOR and not (payload.business_name and payload.category):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="business_name and category are required for vendor signup",
            )

        user = User(
            username=payload.username,
            full_name=payload.full_name,
            email=payload.email,
            mobile=payload.mobile,
            hashed_password=hash_password(payload.password),
            role=payload.role,
        )
        user = self.users.create(user)

        if payload.role == UserRole.VENDOR:
            profile = VendorProfile(
                user_id=user.id,
                business_name=payload.business_name,
                category=payload.category,
            )
            self.users.create_vendor_profile(profile)
            self.db.refresh(user)

        self._ensure_vendor_can_login(user)
        return self._issue_tokens(user)

    def login(self, payload: LoginRequest) -> TokenResponse:
        user = self.users.get_by_username(payload.username)
        if not user or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")
        self._ensure_vendor_can_login(user)
        return self._issue_tokens(user)

    def refresh(self, refresh_token: str) -> TokenResponse:
        try:
            payload = decode_token(refresh_token)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from exc
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        user = self.users.get_by_id(int(payload["sub"]))
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        self._ensure_vendor_can_login(user)
        return self._issue_tokens(user)

    def _ensure_vendor_can_login(self, user: User) -> None:
        """Vendors must be admin-approved (and not blocked) before they can hold
        a session — checked on signup, login, and token refresh alike, so the
        gate can't be bypassed by refreshing a token issued before approval."""
        if user.role != UserRole.VENDOR:
            return
        profile = user.vendor_profile
        if profile and profile.is_blocked:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Your vendor account has been blocked. Please contact support."
            )
        if not profile or not profile.is_approved:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your vendor account is pending admin approval. You can log in once it has been approved.",
            )

    def _issue_tokens(self, user: User) -> TokenResponse:
        access_token = create_access_token(subject=str(user.id), role=user.role.value)
        refresh_token = create_refresh_token(subject=str(user.id))
        return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=UserOut.model_validate(user))
