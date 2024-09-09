document.addEventListener('DOMContentLoaded', () => {
    const newTodoInput = document.getElementById('newTodo');
    const newDueDateInput = document.getElementById('newDueDate');
    const newPriorityInput = document.getElementById('newPriority');
    const newCategoriesInput = document.getElementById('newCategories');
    const addTodoButton = document.getElementById('addTodo');
    const todoList = document.getElementById('todoList');
    const newCategoryInput = document.getElementById('newCategory');
    const addCategoryButton = document.getElementById('addCategory');
    const categoryList = document.getElementById('categoryList');
    const searchTodoInput = document.getElementById('searchTodo');

    function fetchTodos(searchQuery = '') {
        const url = searchQuery ? `/api/todos?search=${encodeURIComponent(searchQuery)}` : '/api/todos';
        fetch(url)
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
            <small class="text-muted">Categories: ${todo.categories.map(cat => cat.name).join(', ') || 'None'}</small>
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
        const categoryIds = Array.from(newCategoriesInput.selectedOptions).map(option => parseInt(option.value));
        if (task) {
            fetch('/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task, due_date: dueDate, priority, category_ids: categoryIds }),
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
                newCategoriesInput.selectedIndex = -1;
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

    function fetchCategories() {
        fetch('/api/categories')
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else if (response.status === 401) {
                    window.location.href = '/login';
                } else {
                    throw new Error('Failed to fetch categories');
                }
            })
            .then(categories => {
                categoryList.innerHTML = '';
                newCategoriesInput.innerHTML = '';
                categories.forEach(category => {
                    const li = createCategoryElement(category);
                    categoryList.appendChild(li);
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    newCategoriesInput.appendChild(option);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    function createCategoryElement(category) {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <span>${category.name}</span>
            <button class="btn btn-sm btn-danger delete-category-btn">Delete</button>
        `;

        const deleteBtn = li.querySelector('.delete-category-btn');
        deleteBtn.addEventListener('click', () => deleteCategory(category.id));

        return li;
    }

    function addCategory() {
        const name = newCategoryInput.value.trim();
        if (name) {
            fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else if (response.status === 401) {
                    window.location.href = '/login';
                } else {
                    throw new Error('Failed to add category');
                }
            })
            .then(() => {
                newCategoryInput.value = '';
                fetchCategories();
            })
            .catch(error => console.error('Error:', error));
        }
    }

    function deleteCategory(id) {
        fetch(`/api/categories/${id}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                fetchCategories();
                fetchTodos();
            } else if (response.status === 401) {
                window.location.href = '/login';
            } else {
                throw new Error('Failed to delete category');
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

    addCategoryButton.addEventListener('click', addCategory);
    newCategoryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addCategory();
        }
    });

    searchTodoInput.addEventListener('input', (e) => {
        const searchQuery = e.target.value.trim();
        fetchTodos(searchQuery);
    });

    fetchTodos();
    fetchCategories();
});
