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
    await new Promise(resolve => setTimeout(resolve, 3000));
    await ModelDaemon.init();
    
})();