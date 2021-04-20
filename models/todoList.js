class TodoList {
  constructor() {
    this.todos = [];
    this.status = "all";
  }

  async loadTodos() {
    await db
      .collection("todos")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          let todoDoc = {
            id: doc.id,
            ...doc.data(),
          };

          if (todoDoc) {
            this.todos.push(new Todo(todoDoc.text, todoDoc.id, todoDoc.isDone));
          }
        });
      });
  }

  async addTodo(newTodo) {
    this.todos.push(newTodo);

    db.collection("todos").doc(`${newTodo.id}`).set({
      text: newTodo.text,
      isDone: newTodo.isDone,
    });

    await this.loadTodos();
  }

  async toggleTodo(id, anotherDone) {
    const todo = this.todos.find((todo) => String(todo.id) === String(id));

    if (todo) {
      todo.markDone(anotherDone);

      db.collection("todos").doc(`${id}`).update({
        isDone: anotherDone,
      });

      await this.loadTodos();
    }
  }

  getTodoById(id) {
    return this.todos.find((todo) => String(todo.id) === String(id));
  }

  getTodos() {
    switch (String(this.status)) {
      case "active": {
        return this.todos.filter((todo) => !todo.isDone);
      }

      case "completed": {
        return this.todos.filter((todo) => todo.isDone);
      }

      default:
        return this.todos;
    }
  }

  setStatus(status) {
    this.status = String(status);
  }

  getStatus() {
    return this.status;
  }

  async removeTodo(id) {
    db.collection("todos").doc(`${id}`).delete();
    await this.loadTodos();
  }

  async removeAll() {
    const allIds = this.todos.map((todo) => String(todo.id));

    allIds.forEach((ids) => {
      db.collection("todos").doc(`${ids}`).delete();
    });

    await this.loadTodos();
  }

  async removeCompleted() {
    const completedIds = this.todos
      .filter((todo) => todo.isDone)
      .map((todo) => String(todo.id));

    completedIds.forEach((ids) => {
      db.collection("todos").doc(`${ids}`).delete();
    });

    await this.loadTodos();
  }

  async swapTodos(idA, idB) {
    const indexA = this.todos.findIndex(
      (todo) => String(todo.id) === String(idA)
    );

    const indexB = this.todos.findIndex(
      (todo) => String(todo.id) === String(idB)
    );

    if (indexA >= 0 && indexB >= 0) {
      [this.todos[indexA], this.todos[indexB]] = [
        this.todos[indexB],
        this.todos[indexA],
      ];

      await apiRequest("PUT", "todos", JSON.stringify(this.todos));
      await this.loadTodos();
    }
  }
}
