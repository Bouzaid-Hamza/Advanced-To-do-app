/* ========= GETTING DATA FROM LOCAL STORAGE ========= */
let todoList;

try {
  todoList = JSON.parse(window.localStorage.getItem("todoList"));
  todoList.forEach(listItem => {
    document.querySelector(".created-lists").innerHTML += listItem.listElement;
  });
} catch(exp) {
  todoList = new Array();
}

/* ========= UPDATE LOCAL STORAGE ========= */
updateLocalStorage = () => {
  window.localStorage.setItem("todoList", JSON.stringify(todoList));
}

/* ========= ADD NEW LIST ========= */
addNewList = (listName = "") => {
  let promise = new Promise((resolve, reject) => {
    if(listName) {
      let listId = new Date().getTime().toString();
      let list = document.createElement("li");
      list.setAttribute("class", "list");
      list.setAttribute("id", listId);
      list.appendChild(document.createTextNode(listName));
      document.querySelector(".created-lists").appendChild(list);
      let listObj = {
        listId: listId,
        listName: listName,
        listElement: list.outerHTML,
        tasks: [],
        checkedTasks: []
      }
      todoList.push(listObj);
      setActiveList(document.querySelector(".list:last-child"), todoList.length-1);
      updateLocalStorage();
      resolve ("New list successfully added");
    } else {
      reject ("Please enter a name for the list");
    }
  });
  return promise;
}

document.querySelector(".add-list-btn").onclick = () => {
  let inputList = document.querySelector(".type-list-name");
  addNewList(inputList.value).then(result => {
    initActiveList();
  });
  inputList.value = "";
}

/* ========= ACTIVE LIST FUNCTION ========= */
setActiveList = (listItem, listIndex) => {
  document.querySelector(".tasks-body").style.display = "block";
  document.querySelectorAll(".list").forEach((item) => {
    item.classList.remove("active-list");
  });
  listItem.classList.add("active-list");
  document.querySelector(".tasks-header").innerHTML = listItem.innerHTML;
  document.querySelector(".todo-tasks").setAttribute("name", listItem.getAttribute("id"));
  document.querySelector(".created-tasks").innerHTML = "";
  todoList[listIndex].tasks.forEach(taskItem => {
    document.querySelector(".created-tasks").innerHTML += taskItem.taskElement;
  });
  todoList[listIndex].checkedTasks.forEach(index => document.querySelectorAll(".task-check")[index].checked = true);
  toggleCheck();
  calcRemainingTasks();
  updateRemainingTasks();
  clearCompletedTasks();
}

/* ========= SET ACTIVE LIST ON CLICK ========= */
initActiveList = () => {
  document.querySelectorAll(".list").forEach((listItem, listIndex) => {
    listItem.onclick = () => { 
      setActiveList(listItem, listIndex);
    }
  })
};

initActiveList();

/* ========= SET THE FIRST LIST AS ACTIVE WHEN THE PAGE LOADS ========= */
window.onload = () => {
  try {
    setActiveList(document.querySelector(".list"), 0);
  } catch(exp) {
    nothingToDo();
  }
}

/* ========= ADD NEW TASK ========= */
addNewTask = (taskName = "") => {
  if(taskName) {
    let task = document.createElement("li");
    task.setAttribute("class", "task");
    let taskCheck = document.createElement("input");
    taskCheck.setAttribute("class", "task-check");
    taskCheck.setAttribute("type", "checkbox");
    let span = document.createElement("span");
    span.setAttribute("class", "task-name");
    span.appendChild(document.createTextNode(taskName));
    task.append(taskCheck, span);
    document.querySelector(".created-tasks").appendChild(task);
    let IndexOfActiveList = todoList.findIndex(item => {
      return item.listId == document.querySelector(".active-list").getAttribute("id");
    });
    let taskObj = {
      taskName: taskName,
      taskElement: task.outerHTML,
    };
    todoList[IndexOfActiveList].tasks.push(taskObj);
    toggleCheck();
    calcRemainingTasks();
    updateRemainingTasks();
    updateLocalStorage();
  }
}

document.querySelector(".add-task-btn").onclick = () => {
  let inputTask = document.querySelector(".type-task-name");
  addNewTask(inputTask.value);
  inputTask.value = "";
}

/* ========= CALCULATION OF REMAINING TASKS ========= */
calcRemainingTasks = () => {
  let tasksCheckboxes = document.querySelectorAll(".task-check:not(:checked)");
  document.querySelector(".remaining-tasks-nbr").innerHTML = tasksCheckboxes.length;
}

updateRemainingTasks = () => {
  document.querySelectorAll(".task-check").forEach(taskCheckboxe => {
    taskCheckboxe.onchange = () => {
      calcRemainingTasks();
      updateCheckedTasks();
    }
  });
}

/* ========= SAVING INDEXES OF THE CHECKED TASKS ========= */
updateCheckedTasks = () => {
  let indexesOfCheckedTasks = new Array();
  document.querySelectorAll(".task-check").forEach((taskCheckboxe, taskIndex) => {
    if(taskCheckboxe.checked) {
      indexesOfCheckedTasks.push(taskIndex);
    }
  });
  let currentListIndex = todoList.findIndex(listItem => {
    return listItem.listId == document.querySelector(".todo-tasks").getAttribute("name");
  });
  todoList[currentListIndex].checkedTasks = indexesOfCheckedTasks;
  updateLocalStorage();
}

/* ========= TOGGLE CHECK WHEN CLICKING NAME ========= */
toggleCheck = () => {
  document.querySelectorAll(".task-name").forEach((taskName, taskIndex) => {
    taskName.onclick = () => {
      let taskCheckboxe = document.querySelectorAll(".task-check")[taskIndex];
      taskCheckboxe.checked = !taskCheckboxe.checked;
      calcRemainingTasks();
      updateCheckedTasks();
    } 
  });
}

/* ========= CLEAR COMPLETED TASKS ========= */
clearCompletedTasks = () => {
  document.querySelector(".clear-completed-tasks").onclick = () => {
    let currentListIndex = todoList.findIndex(listItem => {
      return listItem.listId == document.querySelector(".todo-tasks").getAttribute("name");
    });
    let indexesToRemove = todoList[currentListIndex].checkedTasks;
    for(let i=indexesToRemove.length-1; i>=0; i--) {
      document.querySelectorAll(".task")[indexesToRemove[i]].remove();
      todoList[currentListIndex].tasks.splice(indexesToRemove[i], 1);
    } 
    todoList[currentListIndex].checkedTasks = new Array();
    updateLocalStorage();
  }
}

/* ========= DELETE LIST ========= */
document.querySelector(".delete-list").onclick = () => {
  if(todoList.length == 1) {
    nothingToDo();
    document.querySelector(".list").remove();
    window.localStorage.removeItem("todoList");
  } else {
    let listId = document.querySelector(".todo-tasks").getAttribute("name");
    document.getElementById(listId).remove();
    let indexToRemove = todoList.findIndex(listItem => {
      return listItem.listId == listId;
    });
    todoList.splice(indexToRemove,1);
    if(indexToRemove) {
      setActiveList(document.querySelectorAll(".list")[indexToRemove-1], indexToRemove-1);
    } else {
      setActiveList(document.querySelector(".list"), 0);
    }
    initActiveList();
    updateLocalStorage();
  }
}

/* ========= NO LIST EXIST ========= */
nothingToDo = () => {
  document.querySelector(".tasks-header").innerHTML = "Nothing to do ?"
  document.querySelector(".tasks-body").style.display = "none";
}


