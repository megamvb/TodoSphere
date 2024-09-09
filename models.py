from database import db
from flask_login import UserMixin
from sqlalchemy import Integer, String, Boolean, ForeignKey, Date, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date
from typing import List

# Association table for the many-to-many relationship between Todo and Category
todo_category = Table(
    'todo_category',
    db.Model.metadata,
    db.Column('todo_id', db.Integer, ForeignKey('todo.id')),
    db.Column('category_id', db.Integer, ForeignKey('category.id'))
)

class User(db.Model, UserMixin):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    todos: Mapped[List["Todo"]] = relationship("Todo", back_populates="user", cascade="all, delete-orphan")

class Todo(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    task: Mapped[str] = mapped_column(String(200), nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=True)
    priority: Mapped[int] = mapped_column(Integer, default=1)  # 1: Low, 2: Medium, 3: High
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('user.id'), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="todos")
    categories: Mapped[List["Category"]] = relationship("Category", secondary=todo_category, back_populates="todos")

class Category(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('user.id'), nullable=False)
    user: Mapped["User"] = relationship("User")
    todos: Mapped[List["Todo"]] = relationship("Todo", secondary=todo_category, back_populates="categories")
