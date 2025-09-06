import { UUID } from "node:crypto";
import { AnyUserUUID } from "./AnyUser";
import { Model } from "./Model";

interface AnySpaceBrand {
    readonly __anyspace: unique symbol;
}

export type AnySpaceUUID = UUID & AnySpaceBrand;

export class AnySpace extends Model {

    private readonly uuid: AnySpaceUUID;

    private owner: AnyUserUUID;

    private constructor(
        uuid: AnySpaceUUID,
        owner: AnyUserUUID
    ) {
        super();
        this.uuid = uuid;
        this.owner = owner;
        this.uuid;
        this.owner;
    }

    public static async get(uuid: AnySpaceUUID): Promise<AnySpace> {

        const result = await this.cockroachClient.query(`
            SELECT *
            FROM "AnySpace"
            WHERE uuid = $1    
        `, [uuid.toString()]);

        return new AnySpace(uuid, result.rows[0]);
    }

    protected override save(): void {
        throw new Error("Method not implemented.");
    }

}