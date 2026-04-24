from datetime import date, datetime
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import ConfigDict, Field
from sqlmodel import Session, SQLModel, select

from app.database import get_session
from app.models import Debtor, Transaction, TransactionType

router = APIRouter(tags=["transactions"])


class TransactionCreate(SQLModel):
    amount: Decimal = Field(gt=0)
    occurred_on: date
    type: TransactionType


class TransactionRead(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    debtor_id: int
    amount: Decimal
    occurred_on: date
    type: TransactionType
    created_at: datetime


def _require_debtor(session: Session, debtor_id: int) -> None:
    if session.get(Debtor, debtor_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Debtor not found")


@router.post(
    "/debtors/{debtor_id}/transactions",
    response_model=TransactionRead,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction(
    debtor_id: int,
    body: TransactionCreate,
    session: Annotated[Session, Depends(get_session)],
) -> TransactionRead:
    _require_debtor(session, debtor_id)
    tx = Transaction(
        debtor_id=debtor_id,
        amount=body.amount,
        occurred_on=body.occurred_on,
        type=body.type,
    )
    session.add(tx)
    session.commit()
    session.refresh(tx)
    return TransactionRead.model_validate(tx, from_attributes=True)


@router.get("/debtors/{debtor_id}/transactions", response_model=list[TransactionRead])
def list_transactions(
    debtor_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> list[TransactionRead]:
    _require_debtor(session, debtor_id)
    stmt = (
        select(Transaction)
        .where(Transaction.debtor_id == debtor_id)
        .order_by(Transaction.occurred_on, Transaction.created_at)
    )
    rows = list(session.exec(stmt).all())
    return [TransactionRead.model_validate(r, from_attributes=True) for r in rows]
