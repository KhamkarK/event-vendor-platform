from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.ledger import Invoice, LedgerEntry


class LedgerRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_entry(self, entry: LedgerEntry) -> LedgerEntry:
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def list_entries(self, vendor_id: int) -> list[LedgerEntry]:
        return list(
            self.db.scalars(
                select(LedgerEntry).where(LedgerEntry.vendor_id == vendor_id).order_by(LedgerEntry.created_at.desc())
            )
        )

    def create_invoice(self, invoice: Invoice) -> Invoice:
        self.db.add(invoice)
        self.db.commit()
        self.db.refresh(invoice)
        return invoice

    def list_invoices(self, vendor_id: int) -> list[Invoice]:
        return list(
            self.db.scalars(select(Invoice).where(Invoice.vendor_id == vendor_id).order_by(Invoice.created_at.desc()))
        )

    def get_invoice(self, invoice_id: int) -> Invoice | None:
        return self.db.get(Invoice, invoice_id)

    def update_invoice(self, invoice: Invoice) -> Invoice:
        self.db.commit()
        self.db.refresh(invoice)
        return invoice
