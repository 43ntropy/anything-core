import { Client, Pool } from 'pg';
import { CredentialsDeamon } from '../CredentialsDeamon';

/**
 * This class provide access to the database clients
 * and handle schema setup, updates and migrations.
 */

export abstract class Model {

    protected static cockroachAdmin?: Client;

    protected static cockroachClient?: Pool;

    protected static async init(admin: Client, client: Pool): Promise<void> {

        if (this.cockroachAdmin || this.cockroachClient)
            throw new Error(`Model is already initialized!`);

        this.cockroachAdmin = admin;
        this.cockroachClient = client;

        if (!CredentialsDeamon.isCockroachClientRootKeyEncrypted) {

            // * AnyThing database & user are not created yet

            try {
                await this.cockroachAdmin.query(`
                    BEGIN;
                        CREATE DATABASE IF NOT EXISTS "AnyThing";
                        CREATE USER IF NOT EXISTS "AnyThing";
                        GRANT ALL ON DATABASE "AnyThing" TO "AnyThing";
                    COMMIT;
                `);
            } catch (error) {
                throw new Error(`Failed to initialize database: ${error}`);
            }

        }



    }

    protected abstract save(): void;

}