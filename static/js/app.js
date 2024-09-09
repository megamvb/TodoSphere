document.addEventListener('DOMContentLoaded', () => {
    const newTodoInput = document.getElementById('newTodo');
    const addTodoButton = document.getElementById('addTodo');
    const todoList = document.getElementById('todoList');

    function fetchTodos() {
        fetch('/api/todos')
            .then(response => response.json())
            .then(todos => {
                todoList.innerHTML = '';
                todos.forEach(todo => {
                    const li = createTodoElement(todo);
                    todoList.appendChild(li);
                });
            });
    }

    function createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `list-group-item todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <span>${todo.task}</span>
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

    function addTodo() {
        const task = newTodoInput.value.trim();
        if (task) {
            fetch('/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task }),
            })
            .then(response => response.json())
            .then(() => {
                newTodoInput.value = '';
                fetchTodos();
            });
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
        .then(() => fetchTodos());
    }

    function deleteTodo(id) {
        fetch(`/api/todos/${id}`, {
            method: 'DELETE',
        })
        .then(() => fetchTodos());
    }

    addTodoButton.addEventListener('click', addTodo);
    newTodoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    fetchTodos();
});
