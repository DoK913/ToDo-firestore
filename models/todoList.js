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
        this.todos = [];
        querySnapshot.forEach((doc) => {
          let todoDoc = {
            id: doc.id,
            ...doc.data(),
          };

          if (todoDoc) {
            this.todos.push(
              new Todo(todoDoc.text, todoDoc.id, todoDoc.isDone, todoDoc.order)
            );

            this.todos.sort((prev, next) => prev.order - next.order);
          }
        });
      });
  }

  async addTodo(newTodo) {
    this.todos.push(newTodo);

    await db.collection("todos").doc(`${newTodo.id}`).set({
      text: newTodo.text,
      isDone: newTodo.isDone,
      order: newTodo.order,
    });

    await this.loadTodos();
  }

  async toggleTodo(id, anotherDone) {
    const todo = this.todos.find((todo) => String(todo.id) === String(id));

    if (todo) {
      todo.markDone(anotherDone);

      await db.collection("todos").doc(`${id}`).update({
        isDone: anotherDone,
      });
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
    await db.collection("todos").doc(`${id}`).delete();
    await this.loadTodos();
  }

  async removeAll() {
    const allIds = this.todos.map((todo) => String(todo.id));
    const deleteReqs = allIds.map((id) => {
      return db.collection("todos").doc(`${id}`).delete();
    });

    await Promise.all(deleteReqs);

    await this.loadTodos();
  }

  async removeCompleted() {
    const completedIds = this.todos
      .filter((todo) => todo.isDone)
      .map((todo) => String(todo.id));

    await Promise.all(
      completedIds.map((ids) => {
        return db.collection("todos").doc(`${ids}`).delete();
      })
    );

    await this.loadTodos();
  }

  async genNewOrder(currentElement) {
    let newOrder;
    const indexCur = this.todos.findIndex(
      (todo) => String(todo.id) === String(currentElement.id)
    );

    const curEl = this.todos[indexCur];
    const prevEl = this.todos[indexCur - 1];
    const nextEl = this.todos[indexCur + 1];

    if (prevEl && nextEl) {
      this.newOrder = (Number(prevEl.order) + Number(nextEl.order)) / 2;
    } else if (!prevEl && nextEl) {
      this.newOrder = Number(nextEl.order) / 2;
    } else if (prevEl && !nextEl) {
      this.newOrder = Number(prevEl.order) + 1;
    }

    if (curEl) {
      curEl.setOrder(String(this.newOrder));
    }

    db.collection("todos")
      .doc(`${curEl.id}`)
      .update({
        order: String(this.newOrder),
      });
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
    }
  }

  getOrderOnCreate() {
    let freshOrder;
    if (this.todos.length === 0) {
      freshOrder = 1;
    } else {
      const index = this.todos.length - 1;
      const lastEl = this.todos[index];
      freshOrder = Number(lastEl.order) + 1;
    }
    return String(freshOrder);
  }
}
