from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MetalRateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    gold_rate_per_10g: float | None = None
    silver_rate_per_kg: float | None = None
    updated_at: datetime


class MetalRateUpdate(BaseModel):
    """Both rates are required -- the admin form always submits them together
    (see frontend/src/features/admin/MetalRatesSettings.tsx)."""

    gold_rate_per_10g: float
    silver_rate_per_kg: float
