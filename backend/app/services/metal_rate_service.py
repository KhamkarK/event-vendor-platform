from sqlalchemy.orm import Session

from app.models.metal_rate import MetalRate

SINGLETON_ID = 1


class MetalRateService:
    """Wraps the single metal_rates row (id=1, seeded by its migration) that
    holds the site-wide Gold and Silver rates an admin sets manually."""

    def __init__(self, db: Session):
        self.db = db

    def get(self) -> MetalRate:
        rate = self.db.get(MetalRate, SINGLETON_ID)
        if rate is None:
            # Defensive only -- the migration seeds this row, so this path
            # shouldn't normally be hit.
            rate = MetalRate(id=SINGLETON_ID)
            self.db.add(rate)
            self.db.commit()
            self.db.refresh(rate)
        return rate

    def update(self, gold_rate_per_10g: float, silver_rate_per_kg: float) -> MetalRate:
        rate = self.get()
        rate.gold_rate_per_10g = gold_rate_per_10g
        rate.silver_rate_per_kg = silver_rate_per_kg
        self.db.commit()
        self.db.refresh(rate)
        return rate
