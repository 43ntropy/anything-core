import { EventEmitter } from "stream";

export class Daemon {

    protected static eventBus: EventEmitter = new EventEmitter();

}