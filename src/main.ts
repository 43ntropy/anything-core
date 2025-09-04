import { mkdir } from "fs/promises";
import { CockroachDaemon } from "./modules/CockroachDeamon";
import { ModelDeamon } from "./modules/ModelDeamon";

(async () => {

    try {
        await mkdir("bin");
        await mkdir("data");
        await mkdir("data/tmp");
    } catch {}

    await CockroachDaemon.init("single");

    await ModelDeamon.init();
    
})();