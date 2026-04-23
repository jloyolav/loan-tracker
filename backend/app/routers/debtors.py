from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import field_validator
from sqlmodel import Session, SQLModel, select

from app.database import get_session
from app.models import Debtor

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


@router.post("/debtors", response_model=DebtorRead, status_code=status.HTTP_201_CREATED)
def create_debtor(
    body: DebtorCreate,
    session: Annotated[Session, Depends(get_session)],
) -> Debtor:
    debtor = Debtor(name=body.name)
    session.add(debtor)
    session.commit()
    session.refresh(debtor)
    return debtor


@router.get("/debtors", response_model=list[DebtorRead])
def list_debtors(session: Annotated[Session, Depends(get_session)]) -> list[Debtor]:
    return list(session.exec(select(Debtor)).all())


@router.get("/debtors/{debtor_id}", response_model=DebtorRead)
def get_debtor(
    debtor_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> Debtor:
    debtor = session.get(Debtor, debtor_id)
    if debtor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Debtor not found")
    return debtor
