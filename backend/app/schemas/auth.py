from pydantic import BaseModel, Field

from app.models.user import UserRole
from app.schemas.user import UserOut


class SignupRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=2, max_length=150)
    email: str | None = None
    mobile: str | None = None
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = UserRole.CUSTOMER

    # Required only when role == vendor; validated in the service layer.
    business_name: str | None = None
    category: str | None = None


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class RefreshRequest(BaseModel):
    refresh_token: str
