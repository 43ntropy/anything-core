import { randomUUID, UUID } from "crypto";
import { Model } from "./Model";

interface AnyUserBrand {
    readonly __anyuser: unique symbol;
}

export type AnyUserUUID = UUID & AnyUserBrand;

export class AnyUser extends Model {

    public readonly uuid: AnyUserUUID;

    public displayName: string;

    private constructor(
        uuid: AnyUserUUID,
        displayName: string
    ) {
        super();
        this.uuid = uuid;
        this.displayName = displayName;
        // ! Tmp to avoid unused variable error
        this.uuid;
        this.displayName;
    }

    public static async create(
        displayName: string = ""
    ): Promise<AnyUser> {

        const queryResult = await Model.cockroachClient.query(`
            INSERT INTO 
            public.anyuser ("uuid", "displayname")
            VALUES 
            ($1, $2)
            RETURNING "uuid", "displayname"
        `, [
            randomUUID(),
            displayName
        ]);

        if (queryResult.rowCount == 0)
            throw new Error("AnyUser creation failed");

        return new AnyUser(
            queryResult.rows[0].uuid,
            queryResult.rows[0].displayname
        );

    }

    public static async get(uuid: AnyUserUUID): Promise<AnyUser> {

        const queryResult = await Model.cockroachClient.query(`
            SELECT "uuid", "displayname"
            FROM public.anyuser
            WHERE "uuid" = $1
        `, [
            uuid
        ]);

        if (queryResult.rowCount == 0)
            throw new Error("AnyUser not found");
        
        return new AnyUser(
            queryResult.rows[0].uuid,
            queryResult.rows[0].displayname
        );

    }

    protected override save(): void {
        throw new Error("Method not implemented.");
    }

}