import { EventEmitter } from "stream";

export class Manager {

    protected static eventBus: EventEmitter = new EventEmitter();

}