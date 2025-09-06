import pg from 'pg';
import { Daemon } from "../Daemon";
import { Model } from "../model/Model";
import { readFileSync } from 'node:fs';

export class ModelDaemon extends Daemon {

    private static singleton: ModelDaemon;

    private cockroachAdmin?: pg.Client;
    private cockroachClient?: pg.Pool;

    private constructor() {

        super();

        // - Create accessors for the static properties
        // - implementing a local scoped class
        class ModelAccess extends Model {
            static getRefAdmin = () => Model.cockroachAdmin;
            static getRefClient = () => Model.cockroachClient;
            protected override save(): void {throw new Error('Method not implemented.');}
        }
        this.cockroachAdmin = ModelAccess.getRefAdmin();
        this.cockroachClient = ModelAccess.getRefClient();

        this.setup();

    }

    public static async init(): Promise<ModelDaemon> {

        if (ModelDaemon.singleton)
            return ModelDaemon.singleton;
        const instance = new this();
        await instance.setup();
        return instance;

    }


    private async setup(): Promise<void> {

        // - Initialize the CockroachDB client connections
        this.cockroachAdmin = new pg.Client({
            host: `localhost`,
            port: 26257,
            user: `root`,
            database: `system`,
            ssl: {
                ca: readFileSync('data/cockroach-certs/ca.crt').toString(),
                cert: readFileSync('data/cockroach-certs/client.root.crt').toString(),
                key: readFileSync('data/cockroach-certs/client.root.key').toString(),
            },
        });

        this.cockroachClient;
        this.cockroachAdmin;

    }

    protected info(message: string): void {
        throw new Error(`Method not implemented. ${message}`);
    }
    protected error(message: string): void {
        throw new Error(`Method not implemented. ${message}`);
    }

}