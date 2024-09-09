import os
from flask import Flask, request, jsonify, render_template, redirect, url_for, flash
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
from database import db
from models import User, Todo
from datetime import datetime

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config['SECRET_KEY'] = os.urandom(24)  # Set a secret key for session management
db.init_app(app)

bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

@app.route('/')
@login_required
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        if user and bcrypt.check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('index'))
        flash('Invalid username or password')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
        if existing_user:
            flash('Username or email already exists')
        else:
            hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
            new_user = User(username=username, email=email, password=hashed_password)
            db.session.add(new_user)
            db.session.commit()
            login_user(new_user)
            return redirect(url_for('index'))
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/api/todos', methods=['GET'])
@login_required
def get_todos():
    todos = current_user.todos
    return jsonify([{
        'id': todo.id,
        'task': todo.task,
        'completed': todo.completed,
        'due_date': todo.due_date.isoformat() if todo.due_date else None,
        'priority': todo.priority
    } for todo in todos])

@app.route('/api/todos', methods=['POST'])
@login_required
def add_todo():
    data = request.json
    due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date() if data.get('due_date') else None
    new_todo = Todo(
        task=data['task'],
        due_date=due_date,
        priority=data.get('priority', 1),
        user=current_user
    )
    db.session.add(new_todo)
    db.session.commit()
    return jsonify({
        'id': new_todo.id,
        'task': new_todo.task,
        'completed': new_todo.completed,
        'due_date': new_todo.due_date.isoformat() if new_todo.due_date else None,
        'priority': new_todo.priority
    }), 201

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
@login_required
def update_todo(todo_id):
    todo = Todo.query.filter_by(id=todo_id, user=current_user).first_or_404()
    data = request.json
    todo.completed = data.get('completed', todo.completed)
    todo.task = data.get('task', todo.task)
    todo.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date() if data.get('due_date') else None
    todo.priority = data.get('priority', todo.priority)
    db.session.commit()
    return jsonify({
        'id': todo.id,
        'task': todo.task,
        'completed': todo.completed,
        'due_date': todo.due_date.isoformat() if todo.due_date else None,
        'priority': todo.priority
    })

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
@login_required
def delete_todo(todo_id):
    todo = Todo.query.filter_by(id=todo_id, user=current_user).first_or_404()
    db.session.delete(todo)
    db.session.commit()
    return '', 204

if __name__ == '__main__':
    with app.app_context():
        db.drop_all()  # Drop all existing tables
        db.create_all()  # Create all tables
    app.run(host='0.0.0.0', port=5000)
