class Controller {
  constructor(todoList) {
    this.todoList = todoList;
    this.DND = new DragNDrop(todoList, "li");

    this.todoList.loadTodos().then(() => {
      this.render();
    });

    this.initEvents();
  }

  submit(event) {
    event.preventDefault();
    const input = document.querySelector("input");
    if (input.value != "") {
      let text = input.value;
      let id = Date.now();
      let isDone = false;
      let order = this.todoList.getOrderOnCreate();
      let newTodo = new Todo(text, id, isDone, order);
      this.todoList.addTodo(newTodo).then(() => {
        this.render();
      });
    }
    input.value = "";
  }

  addNewLi({ text, id, isDone }) {
    const ul = document.querySelector("ul");
    const li = document.createElement("li");
    li.id = id;
    li.classList.add("draggable");
    li.classList.add("listItem");
    li.addEventListener("mousedown", this.DND.mouseDownHandler.bind(this.DND));

    const deleteButton = document.createElement("span");
    deleteButton.classList.add("delete");
    deleteButton.innerText = "x";
    deleteButton.addEventListener("click", this.deleteElement.bind(this));

    li.appendChild(deleteButton);

    const checkboxField = document.createElement("input");
    checkboxField.type = "checkbox";
    checkboxField.classList.add("check");
    checkboxField.checked = isDone;
    checkboxField.addEventListener("click", this.toggleMark.bind(this));
    li.appendChild(checkboxField);

    const label = document.createElement("span");
    label.classList.add("todoLabel");
    label.innerText = text;
    li.appendChild(label);

    ul.appendChild(li);
  }

  render() {
    let status = this.todoList.getStatus();
    const allFilter = document.getElementById("all");
    const activeFilter = document.getElementById("active");
    const completedFilter = document.getElementById("completed");
    const list = document.querySelector("ul");
    list.innerHTML = "";
    this.todoList.getTodos(status).forEach((todo) => {
      this.addNewLi(todo);
    });

    // toggle variable to highlight selected filter
    allFilter.classList.toggle("selected", status === "all");
    activeFilter.classList.toggle("selected", status === "active");
    completedFilter.classList.toggle("selected", status === "completed");
  }

  // initialize event listeners
  initEvents() {
    document
      .querySelector("form")
      .addEventListener("submit", this.submit.bind(this));
    document
      .getElementById("all")
      .addEventListener("click", this.switchStatus.bind(this));
    document
      .getElementById("active")
      .addEventListener("click", this.switchStatus.bind(this));
    document
      .getElementById("completed")
      .addEventListener("click", this.switchStatus.bind(this));
    document
      .getElementById("clear")
      .addEventListener("click", this.clearList.bind(this));
    document
      .getElementById("rmCompleted")
      .addEventListener("click", this.clearCompleted.bind(this));
  }

  // change selected filter on click
  switchStatus(event) {
    this.todoList.setStatus(event.target.id);
    this.render();
  }

  // clear todolist
  clearList() {
    if (window.confirm("Clear Todo List?")) {
      this.todoList.removeAll().then(() => {
        this.render();
      });
    }
  }

  // clear completed todo's
  clearCompleted() {
    if (window.confirm("Delete completed Todo's?")) {
      this.todoList.removeCompleted().then(() => {
        this.render();
      });
    }
  }

  // delete element
  deleteElement(event) {
    const id = event.target.parentNode.id;
    if (window.confirm("Delete this Todo?")) {
      this.todoList.removeTodo(id).then(() => {
        this.render();
      });
    }
  }

  // switcher mark "done"
  toggleMark(event) {
    const id = event.target.parentNode.id;
    const todo = this.todoList.getTodoById(id);
    if (todo) {
      this.todoList.toggleTodo(id, !todo.isDone).then(() => {
        this.render();
      });
    }
  }
}
