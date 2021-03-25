/* eslint-disable semi */
/* ========= GETTING DATA FROM LOCAL STORAGE ========= */
let todoList;

try {
  todoList = JSON.parse(window.localStorage.getItem('todoList'));
  todoList.forEach(listItem => {
    document.querySelector('.created-lists').innerHTML += listItem.listElement;
  });
} catch (exp) {
  todoList = [];
}

/* ========= SET THE FIRST LIST AS ACTIVE WHEN THE PAGE LOADS ========= */
window.onload = () => {
  try {
    setActiveList(document.querySelector('.list'), 0);
  } catch (exp) {
    nothingToDo();
  }
  initActiveList();
  toggleCheck();
  editTask();
};

/* ========= ADD NEW LIST ========= */
const addNewList = (listName = '') => {
  const promise = new Promise(() => {
    if (listName) {
      const listId = new Date().getTime().toString();
      const list = document.createElement('li');
      list.setAttribute('class', 'list');
      list.setAttribute('id', listId);
      list.appendChild(document.createTextNode(listName));
      document.querySelector('.created-lists').appendChild(list);
      const listObj = {
        listId: listId,
        listName: listName,
        listElement: list.outerHTML,
        tasks: [],
        checkedTasks: []
      };
      todoList.push(listObj);
      setActiveList(document.querySelector('.list:last-child'), todoList.length - 1);
      initActiveList();
      updateLocalStorage();
    }
  });
  return promise;
};

const getListFromInput = () => {
  const inputList = document.querySelector('.type-list-name');
  addNewList(inputList.value).then(() => {
    initActiveList();
  });
  inputList.value = '';
}

document.querySelector('.add-list-btn').onclick = () => {
  getListFromInput();
};

document.querySelector('.type-list-name').onkeyup = (event) => {
  if (event.key === 'Enter') {
    getListFromInput();
  }
};

/* ========= ACTIVE LIST FUNCTION ========= */
const setActiveList = (listItem, listIndex) => {
  document.querySelector('.tasks-body').style.display = 'block';
  document.querySelectorAll('.list').forEach((item) => {
    item.classList.remove('active-list');
  });
  listItem.classList.add('active-list');
  document.querySelector('.tasks-header').innerHTML = listItem.innerHTML;
  document.querySelector('.todo-tasks').setAttribute('name', listItem.getAttribute('id'));
  document.querySelector('.created-tasks').innerHTML = '';
  todoList[listIndex].tasks.forEach(taskItem => {
    document.querySelector('.created-tasks').innerHTML += taskItem.taskElement;
  });
  todoList[listIndex].checkedTasks.forEach(index => {
    document.querySelectorAll('.task-checkbox input')[index].checked = true;
  });
  document.querySelectorAll('.edit-task-btn').forEach((btn, index) => {
    btn.disabled = false;
    document.querySelectorAll('.task-checkbox input')[index].disabled = false;
    document.querySelectorAll('.label-checkbox')[index].classList.remove('disabled');
  });
  calcRemainingTasks();
  updateRemainingTasks();
  clearCompletedTasks();
  editTask();
};

/* ========= SET ACTIVE LIST ON CLICK ========= */
const initActiveList = () => {
  document.querySelectorAll('.list').forEach((listItem, listIndex) => {
    listItem.onclick = () => {
      setActiveList(listItem, listIndex);
      toggleCheck();
    };
  });
};

/* ========= ADD NEW TASK ========= */
const addNewTask = (taskName = '') => {
  if (taskName) {
    const i = new Date().getTime();
    const task = document.createElement('li');
    task.setAttribute('class', 'task');
    const customCheck = document.createElement('span');
    customCheck.setAttribute('class', 'custom-checkbox task-checkbox');
    const input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    input.setAttribute('id', `checkbox-${i}`);
    input.style.display = 'none';
    const label = document.createElement('label');
    label.setAttribute('for', `checkbox-${i}`);
    label.setAttribute('class', 'label-checkbox');
    customCheck.append(input, label);
    const span = document.createElement('span');
    span.setAttribute('class', 'task-name');
    span.appendChild(document.createTextNode(taskName));
    const div = document.createElement('div');
    div.setAttribute('class', 'line-through-completed');
    span.appendChild(div);
    const btn = document.createElement('button');
    btn.setAttribute('class', 'edit-task-btn');
    btn.appendChild(document.createTextNode('Edit'));
    task.append(customCheck, span, btn);
    document.querySelector('.created-tasks').appendChild(task);
    const IndexOfActiveList = todoList.findIndex(item => {
      return item.listId === document.querySelector('.active-list').getAttribute('id');
    });
    const taskObj = {
      taskName: taskName,
      taskElement: task.outerHTML
    };
    todoList[IndexOfActiveList].tasks.push(taskObj);
    calcRemainingTasks();
    updateRemainingTasks();
    updateLocalStorage();
    editTask();
  }
};

const getTaskFromInput = () => {
  const inputTask = document.querySelector('.type-task-name');
  addNewTask(inputTask.value);
  if (inputTask.value) { toggleCheck(); }
  inputTask.value = '';
}

document.querySelector('.add-task-btn').onclick = () => {
  getTaskFromInput();
};

document.querySelector('.type-task-name').onkeyup = (event) => {
  if (event.key === 'Enter') {
    getTaskFromInput();
  }
};

/* ========= CHANGING THE NAMES ========= */
const editTask = () => {
  document.querySelectorAll('.edit-task-btn').forEach((editBtn, editIndex) => {
    editBtn.onclick = () => {
      const IndexOfActiveList = todoList.findIndex(item => {
        return item.listId === document.querySelector('.active-list').getAttribute('id');
      });
      document.querySelectorAll('.edit-task-btn').forEach((btn, index) => {
        document.querySelectorAll('.task-checkbox input')[index].disabled = true;
        document.querySelectorAll('.label-checkbox')[index].classList.add('disabled');
        if (index !== editIndex) {
          btn.disabled = true;
        }
      });
      const taskName = document.querySelectorAll('.task-name')[editIndex];
      const prevTaskText = todoList[IndexOfActiveList].tasks[editIndex].taskName;
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('placeholder', 'change task name');
      input.setAttribute('class', 'change-task-name');
      if (document.querySelector('.task-name input') === null) {
        input.value = prevTaskText;
      } else {
        input.value = document.querySelector('.task-name input').value;
      }
      taskName.innerHTML = '';
      taskName.appendChild(input);
      input.focus();
      document.body.onclick = () => {
        input.focus();
      };
      input.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          updateTaskText(IndexOfActiveList, prevTaskText, taskName, editIndex, input);
          document.querySelectorAll('.edit-task-btn').forEach((btn, index) => {
            btn.disabled = false;
            document.querySelectorAll('.task-checkbox input')[index].disabled = false;
            document.querySelectorAll('.label-checkbox')[index].classList.remove('disabled');
          });
        }
      });
      // document.body.onclick = () => {
      //   if (document.activeElement !== input) {
      //     updateTaskText(IndexOfActiveList, prevTaskText, taskName, editIndex, input);
      //   }
      // };
    };
  });
};

const updateTaskText = (IndexOfActiveList, prevTaskText, taskNameElement, taskIndex, input) => {
  const line = document.createElement('div');
  line.setAttribute('class', 'line-through-completed');
  taskNameElement.innerHTML = '';
  if (input.value) {
    taskNameElement.append(document.createTextNode(input.value), line);
    todoList[IndexOfActiveList].tasks[taskIndex].taskName = input.value;
    todoList[IndexOfActiveList].tasks[taskIndex].taskElement = taskNameElement.parentElement.outerHTML;
    updateLocalStorage();
  } else {
    taskNameElement.append(document.createTextNode(prevTaskText), line);
  }
  lineThroughCompleted(document.querySelectorAll('.task-checkbox input')[taskIndex], taskIndex);
}

/* ========= CALCULATION OF REMAINING TASKS ========= */
const calcRemainingTasks = () => {
  const tasksCheckboxes = document.querySelectorAll('.task-checkbox input:not(:checked)');
  document.querySelector('.remaining-tasks-nbr').innerHTML = tasksCheckboxes.length;
};

const updateRemainingTasks = () => {
  document.querySelectorAll('.task-checkbox input').forEach(taskCheckbox => {
    taskCheckbox.onchange = () => {
      calcRemainingTasks();
      updateCheckedTasks();
    };
  });
};

/* ========= SAVING INDEXES OF THE CHECKED TASKS ========= */
const updateCheckedTasks = () => {
  const indexesOfCheckedTasks = [];
  document.querySelectorAll('.task-checkbox input').forEach((taskCheckbox, taskIndex) => {
    if (taskCheckbox.checked) {
      indexesOfCheckedTasks.push(taskIndex);
    }
  });
  const currentListIndex = todoList.findIndex(listItem => {
    return listItem.listId === document.querySelector('.todo-tasks').getAttribute('name');
  });
  todoList[currentListIndex].checkedTasks = indexesOfCheckedTasks;
  updateLocalStorage();
};

/* ========= TOGGLE CHECK WHEN CLICKING NAME ========= */
const toggleCheck = () => {
  document.querySelectorAll('.task-name').forEach((taskName, taskIndex) => {
    const taskCheckbox = document.querySelectorAll('.task-checkbox input')[taskIndex];
    // taskName.onclick = () => {
    //   if (taskName.firstElementChild.tagName !== 'INPUT') {
    //     taskCheckbox.checked = !taskCheckbox.checked;
    //     lineThroughCompleted(taskCheckbox, taskIndex);
    //     calcRemainingTasks();
    //     updateCheckedTasks();
    //   }
    // };
    document.querySelectorAll('.task-checkbox input')[taskIndex].onchange = () => {
      if (taskName.firstElementChild.tagName !== 'INPUT') {
        lineThroughCompleted(taskCheckbox, taskIndex);
        calcRemainingTasks();
        updateCheckedTasks();
      }
    };
    lineThroughCompleted(taskCheckbox, taskIndex);
  });
};

/* ========= ANIMATION ON COMPLETED TASKS ========= */
const lineThroughCompleted = (taskCheckbox, taskIndex) => {
  try {
    if (taskCheckbox.checked) {
      document.querySelectorAll('.line-through-completed')[taskIndex].style.width = '100%';
      document.querySelectorAll('.task-name')[taskIndex].style.opacity = '0.5';
    } else {
      document.querySelectorAll('.line-through-completed')[taskIndex].style.width = '0';
      document.querySelectorAll('.task-name')[taskIndex].style.opacity = '1';
    }
  } catch (exp) {
    console.log('error');
  }
};

/* ========= CLEAR COMPLETED TASKS ========= */
const clearCompletedTasks = () => {
  document.querySelector('.clear-completed-tasks').onclick = () => {
    const currentListIndex = todoList.findIndex(listItem => {
      return listItem.listId === document.querySelector('.todo-tasks').getAttribute('name');
    });
    const indexesToRemove = todoList[currentListIndex].checkedTasks;
    for (let i = indexesToRemove.length - 1; i >= 0; i--) {
      document.querySelectorAll('.task')[indexesToRemove[i]].remove();
      todoList[currentListIndex].tasks.splice(indexesToRemove[i], 1);
    }
    todoList[currentListIndex].checkedTasks = [];
    toggleCheck();
    updateLocalStorage();
  };
};

/* ========= DELETE LIST ========= */
document.querySelector('.delete-list').onclick = () => {
  if (todoList.length === 1) {
    nothingToDo();
    document.querySelector('.list').remove();
    window.localStorage.removeItem('todoList');
  } else {
    const listId = document.querySelector('.todo-tasks').getAttribute('name');
    document.getElementById(listId).remove();
    const indexToRemove = todoList.findIndex(listItem => {
      return listItem.listId === listId;
    });
    todoList.splice(indexToRemove, 1);
    if (indexToRemove) {
      setActiveList(document.querySelectorAll('.list')[indexToRemove - 1], indexToRemove - 1);
    } else {
      setActiveList(document.querySelector('.list'), 0);
    }
    initActiveList();
    updateLocalStorage();
  }
};

/* ========= NO LIST EXIST ========= */
const nothingToDo = () => {
  document.querySelector('.tasks-header').innerHTML = 'Something in mind ?';
  document.querySelector('.tasks-body').style.display = 'none';
};

/* ========= UPDATE LOCAL STORAGE ========= */
const updateLocalStorage = () => {
  window.localStorage.setItem('todoList', JSON.stringify(todoList));
};
