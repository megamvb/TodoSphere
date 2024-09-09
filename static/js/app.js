document.addEventListener('DOMContentLoaded', () => {
    const newTodoInput = document.getElementById('newTodo');
    const newDueDateInput = document.getElementById('newDueDate');
    const newPriorityInput = document.getElementById('newPriority');
    const addTodoButton = document.getElementById('addTodo');
    const todoList = document.getElementById('todoList');

    function fetchTodos() {
        fetch('/api/todos')
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else if (response.status === 401) {
                    window.location.href = '/login';
                } else {
                    throw new Error('Failed to fetch todos');
                }
            })
            .then(todos => {
                todoList.innerHTML = '';
                todos.forEach(todo => {
                    const li = createTodoElement(todo);
                    todoList.appendChild(li);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    function createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `list-group-item todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <span>${todo.task}</span>
            <small class="text-muted">Due: ${todo.due_date || 'Not set'}</small>
            <small class="text-muted">Priority: ${getPriorityText(todo.priority)}</small>
            <div class="todo-actions">
                <button class="btn btn-sm btn-success complete-btn">Complete</button>
                <button class="btn btn-sm btn-danger delete-btn">Delete</button>
            </div>
        `;

        const completeBtn = li.querySelector('.complete-btn');
        completeBtn.addEventListener('click', () => toggleTodoComplete(todo.id, !todo.completed));

        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        return li;
    }

    function getPriorityText(priority) {
        switch (priority) {
            case 1: return 'Low';
            case 2: return 'Medium';
            case 3: return 'High';
            default: return 'Unknown';
        }
    }

    function addTodo() {
        const task = newTodoInput.value.trim();
        const dueDate = newDueDateInput.value;
        const priority = parseInt(newPriorityInput.value);
        if (task) {
            fetch('/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task, due_date: dueDate, priority }),
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else if (response.status === 401) {
                    window.location.href = '/login';
                } else {
                    throw new Error('Failed to add todo');
                }
            })
            .then(() => {
                newTodoInput.value = '';
                newDueDateInput.value = '';
                newPriorityInput.value = '1';
                fetchTodos();
            })
            .catch(error => console.error('Error:', error));
        }
    }

    function toggleTodoComplete(id, completed) {
        fetch(`/api/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed }),
        })
        .then(response => {
            if (response.ok) {
                fetchTodos();
            } else if (response.status === 401) {
                window.location.href = '/login';
            } else {
                throw new Error('Failed to update todo');
            }
        })
        .catch(error => console.error('Error:', error));
    }

    function deleteTodo(id) {
        fetch(`/api/todos/${id}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                fetchTodos();
            } else if (response.status === 401) {
                window.location.href = '/login';
            } else {
                throw new Error('Failed to delete todo');
            }
        })
        .catch(error => console.error('Error:', error));
    }

    addTodoButton.addEventListener('click', addTodo);
    newTodoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    fetchTodos();
});
