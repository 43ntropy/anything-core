import { randomUUID, UUID } from "node:crypto";
import { Model } from "./Model";

export class AnyObject extends Model {
    
    private uuid: UUID;
    

    private constructor() {
        super();
        this.uuid = randomUUID({})
    }

    public static create(): AnyObject {
        return new AnyObject();
    }

    public getUuid(): UUID { return this.uuid; }
    public setUuid(uuid: UUID): void { this.uuid = uuid; }

    protected override save(): void {
        throw new Error("Method not implemented.");
    }


}