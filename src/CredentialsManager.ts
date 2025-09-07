import { Manager } from "./Manager";
import fs from 'fs';

export class CredentialsManager extends Manager {

    /**
     * Indicates whether the CockroachDB client root key is encrypted.
     * @throws Error if the root user certificate is not found.
     */
    public static isCockroachClientRootKeyEncrypted = (() => {
        let found: boolean | undefined;
        fs.readdirSync(`data/cockroach-certs`)
            .forEach(file => {
                if (file == `client.root.key`) found = false;
                if (file == `client.root.key.enc`) found = true;
            });
        if (found == undefined)
            throw new Error(`Root user certificate not found!`);
        else return found;
    })();


}