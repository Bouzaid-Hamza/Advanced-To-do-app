/* eslint-disable semi */

/* ========= GLOBAL VARIABLES ========= */
const newListForm = document.querySelector('[data-new-list-from]');
const inputNewList = document.querySelector('[data-input-new-list]');
const listContainer = document.querySelector('[data-lists]');
const newTaskForm = document.querySelector('[data-new-task-from]');
const inputNewTask = document.querySelector('[data-input-new-task]');
const tasksContainer = document.querySelector('[data-tasks]');
const tasksHeader = document.querySelector('[data-tasks-header]');
const tasksBody = document.querySelector('[data-tasks-body]');
const taskTemplate = document.getElementById('task-templte');
const LOCAL_STORAGE_LIST_KEY = 'todo.list';
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'selected.ListId';
let todoList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);
const deleteListBtn = document.querySelector('[data-delete-list]');

/* ========= RENDERING LISTS FUNCTION ========= */
function renderLists () {
  listContainer.innerHTML = '';
  todoList.forEach(list => {
    const li = document.createElement('li');
    li.classList.add('list');
    li.dataset.listId = list.id;
    li.innerText = list.name;
    if (list.id === selectedListId) {
      li.classList.add('active-list');
    }
    listContainer.appendChild(li);
  });
}

renderLists();

/* ========= ADDING NEW LIST ========= */
newListForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!inputNewList.value) return;
  todoList.push({ id: Date.now().toString(), name: inputNewList.value, tasks: [] });
  inputNewList.value = null;
  saveChanges();
  renderLists();
});

/* ========= SETING SELECTED LIST ========= */
listContainer.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'li') {
    selectedListId = e.target.dataset.listId;
    saveChanges();
    renderLists();
    renderTasks();
  }
});

/* ========= DELETING LISTS ========= */
deleteListBtn.addEventListener('click', () => {
  todoList = todoList.filter(list => list.id !== selectedListId);
  selectedListId = '';
  saveChanges();
  renderLists();
  renderTasks();
});

/* ========= RENDERING TASKS FUNCTION ========= */
function renderTasks () {
  tasksContainer.innerHTML = '';
  if (selectedListId) {
    tasksBody.style.display = '';
    const selectedList = todoList.find(list => list.id === selectedListId);
    tasksHeader.innerText = selectedList.name;
    selectedList.tasks.forEach(task => {
      const taskElement = document.importNode(taskTemplate.content, true);
      taskElement.querySelector('input').id = task.id;
      taskElement.querySelector('input').checked = task.complete;
      taskElement.querySelector('label').htmlFor = task.id;
      taskElement.querySelector('.task-name').innerText = task.name;
      tasksContainer.appendChild(taskElement);
    });
  } else {
    tasksBody.style.display = 'none';
    tasksHeader.innerText = 'NO LIST IS SELECTED';
  }
}

renderTasks();

/* ========= ADDING NEW TASK ========= */
newTaskForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!inputNewTask.value) return;
  todoList.find(list => list.id === selectedListId).tasks.push({ id: Date.now().toString(), name: inputNewTask.value, complete: false });
  inputNewTask.value = null;
  saveChanges();
  renderTasks();
});

/* ========= SETING COMPLETED TASKS ========= */
tasksContainer.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'input') {
    const selectedList = todoList.find(list => list.id === selectedListId);
    const selectedTask = selectedList.tasks.find(task => task.id === e.target.id);
    selectedTask.complete = e.target.checked;
    saveChanges();
  }
});

/* ========= SAVING CHANGES IN LOCAL STORAGE ========= */
function saveChanges () {
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(todoList));
  localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
}

/* ========= SAVE AND RENDER FUNCTION ========= */
function saveAndRender () {
  saveChanges();
  renderLists();
  renderTasks();
}
