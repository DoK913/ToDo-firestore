class Todo {
  constructor(text, id, isDone, order) {
    this.text = text;
    this.id = id;
    this.isDone = isDone;
    this.order = order;
  }

  markDone(boolean) {
    this.isDone = boolean;
  }

  setOrder(value) {
    this.order = value;
  }
}
