import { Pool } from 'pg';
import { CredentialsDeamon } from '../CredentialsDaemon';

/**
 * This class provide access to the database clients
 * and handle schema setup, updates and migrations.
 */

export abstract class Model {

    protected static cockroachAdmin: Pool;

    protected static cockroachClient: Pool;

    protected static async init(admin: Pool, client: Pool): Promise<void> {

        if (Model.cockroachAdmin || Model.cockroachClient)
            throw new Error(`Model is already initialized!`);

        Model.cockroachAdmin = admin;
        Model.cockroachClient = client;

        if (!CredentialsDeamon.isCockroachClientRootKeyEncrypted) {

            // * AnyThing database & user are not created yet

            try {
                await Model.cockroachAdmin.query(`
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

        // ! TMP
        // ! For now we use the admin client as the main client
        await Model.cockroachAdmin.query(`USE "AnyThing";`);
        // ! TMP

        await Model.cockroachClient.query(`
            CREATE TABLE IF NOT EXISTS public.anyuser (
                "uuid" uuid NOT NULL,
	            "displayname" string NOT NULL,
            	CONSTRAINT anyuser_pk PRIMARY KEY ("uuid")
            );
        `);

        await Model.cockroachClient.query(`
            CREATE TABLE IF NOT EXISTS public.anyspace (
	            "uuid" uuid NOT NULL,
	            "owner" uuid NOT NULL,
            	CONSTRAINT anyspace_pk PRIMARY KEY ("uuid"),
            	CONSTRAINT anyspace_anyuser_fk FOREIGN KEY ("owner") REFERENCES public.anyuser("uuid")
            );
        `);

        await Model.cockroachClient.query(`
            CREATE TABLE IF NOT EXISTS public.anyobject (
	            "uuid" uuid NOT NULL,
            	"space" uuid NOT NULL,
            	"blob" bytes NOT NULL,
            	CONSTRAINT anyobject_pk PRIMARY KEY ("uuid"),
            	CONSTRAINT anyobject_anyspace_fk FOREIGN KEY ("space") REFERENCES public.anyspace("uuid")
            );
        `);

        await Model.cockroachClient.query(`
            CREATE TABLE IF NOT EXISTS public.space_user (
	            "space" uuid NOT NULL,
            	"member" uuid NOT NULL,
            	"create" bool NOT NULL,
            	"view" bool NOT NULL,
            	edit bool NOT NULL,
            	"delete" bool NOT NULL,
            	"share" bool NOT NULL,
            	CONSTRAINT space_user_pk PRIMARY KEY ("space","member"),
            	CONSTRAINT space_user_anyspace_fk FOREIGN KEY ("space") REFERENCES public.anyspace("uuid"),
            	CONSTRAINT space_user_anyuser_fk FOREIGN KEY ("member") REFERENCES public.anyuser("uuid")
            );
        `);

    }

    protected abstract save(): void;

}