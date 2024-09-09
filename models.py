from app import db
from sqlalchemy import Integer, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

class Todo(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    task: Mapped[str] = mapped_column(String(200), nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
