const apiUrl = 'http://localhost:3000/tasks';
let tasks = [];
let filteredTasks = [];
let currentPage = 1;
const tasksPerPage = 3;

document.addEventListener('DOMContentLoaded', fetchTasks);

async function fetchTasks() {
    try {
        const response = await fetch(apiUrl);
        tasks = await response.json();
        filteredTasks = tasks;  // Inicialmente, todas as tarefas estão filtradas
        displayTasks();
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

function displayTasks() {
    const list = document.getElementById('todo-list');
    list.innerHTML = '';

    const start = (currentPage - 1) * tasksPerPage;
    const end = start + tasksPerPage;
    const tasksToDisplay = filteredTasks.slice(start, end);

    tasksToDisplay.forEach(task => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div>
                <strong>Title:</strong> <input type="text" value="${task.title}" disabled />
            </div>
            <div>
                <strong>Description:</strong> <textarea disabled>${task.description}</textarea>
            </div>
            <button onclick="editTask('${task.id}', this)">Edit</button>
            <button onclick="deleteTask('${task.id}')">Delete</button>
        `;
        list.appendChild(listItem);
    });

    updatePagination();
}

function updatePagination() {
    const pageInfo = document.getElementById('page-info');
    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

function changePage(direction) {
    currentPage += direction;
    displayTasks();
}

async function addTask() {
    const titleInput = document.getElementById('todo-input-title');
    const descriptionInput = document.getElementById('todo-input-description');
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (title && description) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, description })
            });

            if (response.ok) {
                console.log('Task added successfully');
                titleInput.value = '';
                descriptionInput.value = '';
                fetchTasks();
            } else {
                console.error('Error adding task:', response.statusText);
            }
        } catch (error) {
            console.error('Error adding task:', error);
        }
    } else {
        console.error('Title and description are required');
    }
}

async function deleteTask(id) {
    try {
        const response = await fetch(`${apiUrl}/id/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('Task deleted successfully');
            fetchTasks();
        } else {
            console.error('Error deleting task:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

async function editTask(id, button) {
    const listItem = button.parentNode;
    const titleInput = listItem.querySelector('div input[type="text"]');
    const descriptionInput = listItem.querySelector('div textarea');

    if (titleInput.disabled && descriptionInput.disabled) {
        // Modo de edição
        titleInput.disabled = false;
        descriptionInput.disabled = false;
        button.textContent = 'Save';
        listItem.classList.add('editing');
    } else {
        // Salvar as alterações
        titleInput.disabled = true;
        descriptionInput.disabled = true;
        button.textContent = 'Edit';
        listItem.classList.remove('editing');
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();

        if (title && description) {
            try {
                const response = await fetch(`${apiUrl}/id/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ title, description })
                });

                if (response.ok) {
                    console.log('Task updated successfully');
                    fetchTasks();
                } else {
                    console.error('Error updating task:', response.statusText);
                }
            } catch (error) {
                console.error('Error updating task:', error);
            }
        } else {
            console.error('Title and description are required for updating');
        }
    }
}

function filterTasks() {
    const filterInput = document.getElementById('filter-input').value.toLowerCase();
    filteredTasks = tasks.filter(task => task.title.toLowerCase().includes(filterInput));
    currentPage = 1;  // Reset to the first page
    displayTasks();
}
