from __future__ import annotations

from datetime import date, datetime, timezone
from decimal import Decimal
from enum import Enum
from typing import Optional

from sqlalchemy import CheckConstraint, Column, DateTime, Enum as SQLEnum, ForeignKey, Numeric, String
from sqlmodel import Field, Relationship, SQLModel


class TransactionType(str, Enum):
    LOAN = "loan"
    PAYMENT = "payment"


class Debtor(SQLModel, table=True):
    __tablename__ = "debtor"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(
        min_length=1,
        max_length=255,
        sa_column=Column(String(255), nullable=False),
    )


class Transaction(SQLModel, table=True):
    __tablename__ = "loan_transaction"
    __table_args__ = (CheckConstraint("amount > 0", name="ck_transaction_amount_positive"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    debtor_id: int = Field(
        sa_column=Column(ForeignKey("debtor.id", ondelete="CASCADE"), nullable=False),
    )
    amount: Decimal = Field(
        sa_column=Column(Numeric(12, 2), nullable=False),
    )
    occurred_on: date = Field(nullable=False)
    type: TransactionType = Field(
        sa_column=Column(
            SQLEnum(
                TransactionType,
                name="transaction_type",
                native_enum=True,
                values_callable=lambda enum_cls: [member.value for member in enum_cls],
            ),
            nullable=False,
        ),
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )

    debtor: Debtor = Relationship()
