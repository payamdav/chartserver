import EventEmitter from "events"

class MyEmitter extends EventEmitter {}

export const events = new MyEmitter();

