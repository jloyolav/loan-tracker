from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import field_validator
from sqlmodel import Session, SQLModel, select
from sqlalchemy import func, case
from app.models import TransactionType, Transaction

from app.database import get_session
from app.models import Debtor, TransactionType

router = APIRouter(tags=["debtors"])

class DebtorCreate(SQLModel):
    name: str

    @field_validator("name")
    @classmethod
    def strip_and_validate(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("name must not be blank")
        if len(stripped) > 255:
            raise ValueError("name must be at most 255 characters")
        return stripped


class DebtorRead(SQLModel):
    id: int
    name: str
    balance: int

def _balance_expression():
    return func.coalesce(
        # func coalesce is used to return the first non-null value in the list 
        # (in case there are no transactions for a debtor, it will return 0)
        func.sum(
            case(
                (Transaction.type == TransactionType.LOAN, -Transaction.amount),
                else_=Transaction.amount
            )# if the transaction is a loan, add the amount, otherwise subtract the amount
        ),
        0,
    )

def _compute_balance(debtor_id: int, session: Session) -> int:
    result = session.exec(
        select(_balance_expression()).where(Transaction.debtor_id == debtor_id)
    ).one()
    return int(result)


@router.post("/debtors", response_model=DebtorRead, status_code=status.HTTP_201_CREATED)
def create_debtor(
    body: DebtorCreate,
    session: Annotated[Session, Depends(get_session)],
) -> DebtorRead:
    debtor = Debtor(name=body.name)
    session.add(debtor)
    session.commit()
    session.refresh(debtor)
    return DebtorRead(id=debtor.id, name=debtor.name, balance=0)


@router.get("/debtors", response_model=list[DebtorRead])
def list_debtors(session: Annotated[Session, Depends(get_session)]) -> list[DebtorRead]:
    rows = session.exec(
        select(Debtor, _balance_expression().label("balance"))
        .outerjoin(Transaction, Transaction.debtor_id == Debtor.id)
        .group_by(Debtor.id)
    ).all()
    # outerjoin is used to join the debtor table with the transaction table
    # group_by is used to group the results by the debtor id

    return [DebtorRead(id=debtor.id, name=debtor.name, balance=int(balance)) for debtor, balance in rows]

@router.get("/debtors/{debtor_id}", response_model=DebtorRead)
def get_debtor(
    debtor_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> Debtor:
    debtor = session.get(Debtor, debtor_id)
    if debtor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Debtor not found")

    # instead of directly returning the debtor, we return a DebtorRead object with the balance computed
    return DebtorRead(id=debtor.id, name=debtor.name, balance=_compute_balance(debtor.id, session))
