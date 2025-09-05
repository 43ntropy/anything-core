import { randomUUID, UUID } from "node:crypto";
import { Model } from "./Model";
import Stream from "node:stream";
import { AnyUserUUID } from "./AnyUser";

/*
    Table: AnyObject

    - uuid: UUID PRIMARY KEY NOT NULL INDEXED
    - owner UUID REFERENCES AnyUser(uuid) NOT NULL INDEXED
    - acl_id UUID[] REFERENCES AnyUser(uuid) NOT NULL INDEXED
    - acl_read: BOOLEAN[] NOT NULL
    - acl_write: BOOLEAN[] NOT NULL
    - acl_delete: BOOLEAN[] NOT NULL
    - acl_share: BOOLEAN[] NOT NULL

*/


interface AnyObjectBrand {
    readonly __anyobject: unique symbol;
}

export type AnyObjectUUID = UUID & AnyObjectBrand;

export class AnyObject extends Model {
    
    private readonly uuid: AnyObjectUUID;

    private owner: AnyUserUUID;

    private data_buffer?: Buffer;
    private data_stream?: Stream;

    private constructor() {
        super();
        this.uuid = randomUUID({}) as AnyObjectUUID;
        this.data_buffer;
        this.data_stream;
        this.owner = randomUUID({}) as AnyUserUUID;
        this.owner;
    }

    public static create(): AnyObject {
        return new AnyObject();
    }

    public getUuid(): UUID { return this.uuid as UUID; }

    protected override save(): void {
        throw new Error("Method not implemented.");
    }


}