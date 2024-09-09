import os
from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Integer, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
db.init_app(app)

class Todo(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    task: Mapped[str] = mapped_column(String(200), nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/todos', methods=['GET'])
def get_todos():
    todos = db.session.execute(db.select(Todo).order_by(Todo.id)).scalars()
    return jsonify([{'id': todo.id, 'task': todo.task, 'completed': todo.completed} for todo in todos])

@app.route('/api/todos', methods=['POST'])
def add_todo():
    data = request.json
    new_todo = Todo(task=data['task'])
    db.session.add(new_todo)
    db.session.commit()
    return jsonify({'id': new_todo.id, 'task': new_todo.task, 'completed': new_todo.completed}), 201

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    todo = db.get_or_404(Todo, todo_id)
    data = request.json
    todo.completed = data['completed']
    db.session.commit()
    return jsonify({'id': todo.id, 'task': todo.task, 'completed': todo.completed})

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    todo = db.get_or_404(Todo, todo_id)
    db.session.delete(todo)
    db.session.commit()
    return '', 204

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000)
