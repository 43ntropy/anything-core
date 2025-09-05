import { UUID } from "crypto";
import { Model } from "./Model";

interface AnyUserBrand {
    readonly __anyobject: unique symbol;
}

export type AnyUserUUID = UUID & AnyUserBrand;

export class AnyUser extends Model {

    private readonly uuid: AnyUserUUID;

    private constructor() {
        super();
        this.uuid = crypto.randomUUID() as AnyUserUUID;
        this.uuid;
    }


    protected override save(): void {
        throw new Error("Method not implemented.");
    }
    
}