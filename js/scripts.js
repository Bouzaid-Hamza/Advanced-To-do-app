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
  todoList[listIndex].checkedTasks.forEach(index => document.querySelectorAll(".task-checkbox input")[index].checked = true);
  calcRemainingTasks();
  updateRemainingTasks();
  clearCompletedTasks();
  editTask();
}

/* ========= SET ACTIVE LIST ON CLICK ========= */
initActiveList = () => {
  document.querySelectorAll(".list").forEach((listItem, listIndex) => {
    listItem.onclick = () => { 
      setActiveList(listItem, listIndex);
      toggleCheck();
    }
  })
};

/* ========= SET THE FIRST LIST AS ACTIVE WHEN THE PAGE LOADS ========= */
window.onload = () => {
  try {
    setActiveList(document.querySelector(".list"), 0);
  } catch(exp) {
    nothingToDo();
  }
  initActiveList();
  toggleCheck();
  editTask();
}

/* ========= ADD NEW TASK ========= */
addNewTask = (taskName = "") => {
  if(taskName) {
    let i = new Date().getTime();
    let task = document.createElement("li");
    task.setAttribute("class", "task");
    let customCheck = document.createElement("span");
    customCheck.setAttribute("class", "custom-checkbox task-checkbox");
    let input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    input.setAttribute("id", `checkbox-${i}`);
    input.style.display = "none";
    let label = document.createElement("label");
    label.setAttribute("for", `checkbox-${i}`);
    label.setAttribute("class", "label-checkbox");
    customCheck.append(input, label);
    let span = document.createElement("span");
    span.setAttribute("class", "task-name");
    span.appendChild(document.createTextNode(taskName));
    let div = document.createElement("div");
    div.setAttribute("class", "line-through-completed");
    span.appendChild(div);
    let btn = document.createElement("button");
    btn.setAttribute("class", "edit-task-btn");
    btn.appendChild(document.createTextNode("Edit"));
    task.append(customCheck, span, btn);
    document.querySelector(".created-tasks").appendChild(task);
    let IndexOfActiveList = todoList.findIndex(item => {
      return item.listId == document.querySelector(".active-list").getAttribute("id");
    });
    let taskObj = {
      taskName: taskName,
      taskElement: task.outerHTML,
    };
    todoList[IndexOfActiveList].tasks.push(taskObj);
    calcRemainingTasks();
    updateRemainingTasks();
    updateLocalStorage();
    editTask();
  }
}

document.querySelector(".add-task-btn").onclick = () => {
  let inputTask = document.querySelector(".type-task-name");
  addNewTask(inputTask.value);
  if(inputTask.value) {toggleCheck();}
  inputTask.value = "";
}

/* ========= CHANGING THE NAMES ========= */
editTask = () => {
  document.querySelectorAll(".edit-task-btn").forEach((editBtn, editIndex) => {
    editBtn.onclick = () => {
      let IndexOfActiveList = todoList.findIndex(item => {
        return item.listId == document.querySelector(".active-list").getAttribute("id");
      });
      let taskName = document.querySelectorAll(".task-name")[editIndex];
      let prevTaskText = todoList[IndexOfActiveList].tasks[editIndex].taskName;
      let input = document.createElement("input");
      input.setAttribute("type", "text");
      input.setAttribute("placeholder", "change task name");
      input.setAttribute("class", "change-task-name");
      if(document.querySelector(".task-name input") === null) {
        input.value = prevTaskText;
      } else {
        input.value = document.querySelector(".task-name input").value;
      }
      taskName.innerText = "";
      taskName.appendChild(input);
      input.focus();
      input.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          if(input.value) {
            let line = '<div class="line-through-completed"></div>';
            taskName.innerHTML = input.value + line;
            todoList[IndexOfActiveList].tasks[editIndex].taskName = input.value;
            todoList[IndexOfActiveList].tasks[editIndex].taskElement = taskName.parentElement.outerHTML;
            updateLocalStorage();
          } else {
            taskName.innerHTML = prevTaskText + line;
          }
          lineThroughCompleted(document.querySelectorAll(".task-checkbox input")[editIndex], editIndex); 
        }
      });
      document.body.onclick = () => {
        if (document.activeElement != input) {
          if(input.value) {
            let line = '<div class="line-through-completed"></div>';
            taskName.innerHTML = input.value + line;
            todoList[IndexOfActiveList].tasks[editIndex].taskName = input.value;
            todoList[IndexOfActiveList].tasks[editIndex].taskElement = taskName.parentElement.outerHTML;
            updateLocalStorage();
          } else {
            taskName.innerHTML = prevTaskText + line;
          } 
          lineThroughCompleted(document.querySelectorAll(".task-checkbox input")[editIndex], editIndex);  
        } 
      }
    }
  });
}

/* ========= CALCULATION OF REMAINING TASKS ========= */
calcRemainingTasks = () => {
  let tasksCheckboxes = document.querySelectorAll(".task-checkbox input:not(:checked)");
  document.querySelector(".remaining-tasks-nbr").innerHTML = tasksCheckboxes.length;
}

updateRemainingTasks = () => {
  document.querySelectorAll(".task-checkbox input").forEach(taskCheckbox => {
    taskCheckbox.onchange = () => {
      calcRemainingTasks();
      updateCheckedTasks();
    }
  });
}

/* ========= SAVING INDEXES OF THE CHECKED TASKS ========= */
updateCheckedTasks = () => {
  let indexesOfCheckedTasks = new Array();
  document.querySelectorAll(".task-checkbox input").forEach((taskCheckbox, taskIndex) => {
    if(taskCheckbox.checked) {
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
    let taskCheckbox = document.querySelectorAll(".task-checkbox input")[taskIndex];
    taskName.onclick = () => {
      if(taskName.firstElementChild.tagName !== "INPUT") {
        taskCheckbox.checked = !taskCheckbox.checked;
        lineThroughCompleted(taskCheckbox, taskIndex);
        calcRemainingTasks();
        updateCheckedTasks();
      }
    }
    document.querySelectorAll(".task-checkbox input")[taskIndex].onchange = () => {
      if(taskName.firstElementChild.tagName !== "INPUT") {
        lineThroughCompleted(taskCheckbox, taskIndex);
        calcRemainingTasks();
        updateCheckedTasks();
      }
    }
    lineThroughCompleted(taskCheckbox, taskIndex);
  });
}

/* ========= ANIMATION ON COMPLETED TASKS ========= */
lineThroughCompleted = (taskCheckbox, taskIndex) => {
  if(taskCheckbox.checked) {
    document.querySelectorAll(".line-through-completed")[taskIndex].style.width = "100%";
    document.querySelectorAll(".task-name")[taskIndex].style.opacity = "0.5";
  } else {
    document.querySelectorAll(".line-through-completed")[taskIndex].style.width = "0";
    document.querySelectorAll(".task-name")[taskIndex].style.opacity = "1";
  }
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
    toggleCheck();
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
  document.querySelector(".tasks-header").innerHTML = "Something in mind ?"
  document.querySelector(".tasks-body").style.display = "none";
}