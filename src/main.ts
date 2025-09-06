import { mkdir } from "fs/promises";
import { CockroachDaemon } from "./modules/CockroachDaemon";
import { ModelDaemon } from "./modules/ModelDaemon";

(async () => {

    try {
        await mkdir("bin");
        await mkdir("data");
        await mkdir("data/tmp");
    } catch {}

    await CockroachDaemon.init("single");

    await ModelDaemon.init();
    
})();