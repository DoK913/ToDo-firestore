class Todo {
  constructor(text, id, isDone) {
    this.text = text;
    this.id = id;
    this.isDone = isDone;
  }

  markDone(boolean) {
    this.isDone = boolean;
  }
}
