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
const remainingTaskNbr = document.querySelector('[data-remaining-tasks-nbr]');
const deleteListBtn = document.querySelector('[data-delete-list]');
const clearCompletedTasksBtn = document.querySelector('[data-clear-completed-tasks]');
const LOCAL_STORAGE_LIST_KEY = 'todo.list';
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'selected.ListId';
let todoList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);
let selectedList = todoList.find(list => list.id === selectedListId);

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
    selectedList = todoList.find(list => list.id === selectedListId);
    saveAndRenderAll();
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
    tasksBody.style.display = 'block';
    tasksHeader.innerText = selectedList.name;
    selectedList.tasks.forEach(task => {
      const taskElement = document.importNode(taskTemplate.content, true);
      taskElement.querySelector('input').id = task.id;
      taskElement.querySelector('input').checked = task.complete;
      taskElement.querySelector('label').htmlFor = task.id;
      taskElement.querySelector('.task-name').innerText = task.name;
      taskElement.querySelector('form').id = `form-${task.id}`;
      taskElement.querySelector('.edit-task-btn').id = `edit-${task.id}`;
      tasksContainer.appendChild(taskElement);
    });
  } else {
    tasksBody.style.display = '';
    tasksHeader.innerText = 'NOTHING FOR THE MOMENT';
  }
}

renderTasks();

/* ========= ADDING NEW TASK ========= */
newTaskForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!inputNewTask.value) return;
  selectedList.tasks.push({ id: Date.now().toString(), name: inputNewTask.value, complete: false });
  inputNewTask.value = null;
  saveChanges();
  renderTasks();
  renderRemainingTasks();
});

/* ========= SETING COMPLETED TASKS ========= */
tasksContainer.addEventListener('click', e => {
  if (e.target.getAttribute('type') === 'checkbox') {
    const selectedTask = selectedList.tasks.find(task => task.id === e.target.id);
    selectedTask.complete = e.target.checked;
    saveChanges();
    renderRemainingTasks();
  }
  /* ========= EDITING TASKS ========= */
  if (e.target.tagName.toLowerCase() === 'button') {
    const selectedTask = selectedList.tasks.find(task => `edit-${task.id}` === e.target.id);
    renderTasks();
    document.getElementById(selectedTask.id).parentElement.style.display = 'none';
    document.querySelector(`#form-${selectedTask.id} input`).style.display = 'block';
    document.querySelector(`#form-${selectedTask.id} input`).focus();
    upDateTaskForm(selectedTask.id, selectedTask);
  }
});

function upDateTaskForm (id, task) {
  const editTaskInput = document.querySelector(`#form-${id} input`);
  document.getElementById(`form-${id}`).addEventListener('submit', e => {
    e.preventDefault();
    if (editTaskInput.value) {
      task.name = editTaskInput.value;
      saveChanges();
      renderTasks();
    } else {
      editTaskInput.placeholder = 'Please enter a name';
      editTaskInput.classList.add('warning-msg');
      window.setTimeout(() => {
        editTaskInput.placeholder = 'Change name';
        editTaskInput.classList.remove('warning-msg');
      }, 3000);
    }
  });
}

/* ========= CLEARING COMPLETED TASKS ========= */
clearCompletedTasksBtn.addEventListener('click', () => {
  selectedList.tasks = selectedList.tasks.filter(task => !task.complete);
  saveChanges();
  renderTasks();
  renderRemainingTasks();
});

/* ========= CALCULATING REMAINING TASKS ========= */
function renderRemainingTasks () {
  if (!selectedListId) return;
  const nbr = selectedList.tasks.filter(task => !task.complete).length;
  const text = nbr === 1 ? 'task' : 'tasks';
  remainingTaskNbr.innerText = `${nbr} ${text}`;
}

renderRemainingTasks();

/* ========= SAVING CHANGES IN LOCAL STORAGE ========= */
function saveChanges () {
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(todoList));
  localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
}

/* ========= SAVE AND RENDER FUNCTION ========= */
function saveAndRenderAll () {
  saveChanges();
  renderLists();
  renderTasks();
  renderRemainingTasks();
}
