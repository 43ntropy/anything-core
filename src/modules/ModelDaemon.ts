import pg from 'pg';
import { Daemon } from "../Daemon";
import { Model } from "../model/Model";
import { readFileSync } from 'node:fs';

export class ModelDaemon extends Daemon {

    private static singleton: ModelDaemon;

    private cockroachAdmin: pg.Pool;
    private cockroachClient: pg.Pool;

    public static async init(): Promise<ModelDaemon> {

        if (this.singleton)
            return this.singleton;

        // - Create accessors for the static properties
        // - implementing a local scoped class
        class ModelAccess extends Model {
            static getRefInit = Model.init;
            protected override save(): void { throw new Error('You should not be there :/'); }
        }

        const admin = new pg.Pool({
            host: `localhost`,
            port: 26257,
            user: `root`,
            database: `defaultdb`,
            ssl: {
                ca: readFileSync('data/cockroach-certs/ca.crt').toString(),
                cert: readFileSync('data/cockroach-certs/client.root.crt').toString(),
                key: readFileSync('data/cockroach-certs/client.root.key').toString(),
            },
        });

        const client = admin; // ! Temporary for development

        await admin.connect();
        await client.connect();

        await ModelAccess.getRefInit(admin, client);

        this.singleton = new this(admin, client);
        return this.singleton;

    }

    private constructor(
        admin: pg.Pool,
        client: pg.Pool
    ) {
        super();
        this.cockroachAdmin = admin;
        this.cockroachClient = client;
        this.cockroachAdmin; // ! To avoid the unused variable warning
        this.cockroachClient; // ! To avoid the unused variable warning
    }

    protected info(message: string): void {
        throw new Error(`Method not implemented. ${message}`);
    }
    protected error(message: string): void {
        throw new Error(`Method not implemented. ${message}`);
    }

}