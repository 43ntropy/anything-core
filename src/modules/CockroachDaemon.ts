import fs from 'fs/promises';
import { Environment } from '../Enviroment';
import { exit } from 'process';
import { ChildProcess, exec, spawn } from 'child_process';
import { promisify } from 'util';
import { Daemon } from '../Daemon';

export class CockroachDaemon extends Daemon {

    private static singleton: CockroachDaemon;

    private process: ChildProcess | null = null;

    private mode: "single" | "cluster";

    private status: "running" | "stopped" = "stopped";


    private constructor(mode: "single" | "cluster") {
        super();
        if (CockroachDaemon.singleton) throw new Error("Daemon already instantiated");
        CockroachDaemon.singleton = this;
        this.mode = mode;
        setInterval(async () => {await this.monitor()}, 250);
    }

    public static async init(mode: "single"): Promise<CockroachDaemon> {
        if (CockroachDaemon.singleton)
            return CockroachDaemon.singleton;
        const instance = new this(mode);
        await instance.setup();
        instance.startup();
        return instance;
    }

    /**
     * This method checks if CockroachDB is installed and up to date;
     * if not, it downloads and installs the correct version.
     */
    private async setup(): Promise<void> {

        // - Check for existing binary and version
        const binary_version =
            (await fs.readdir(`bin/`))
                .find(f => f.startsWith(`cockroach-`))?.split('-')[1];


        // - Binary exists and is up to date
        if (binary_version && binary_version == Environment.COCKROACH_VERSION) {
            this.info(`Cockroach (${Environment.COCKROACH_VERSION}) binary found and up to date!`);
        }


        // - Binary exists but outdated
        else if (binary_version && binary_version != Environment.COCKROACH_VERSION) {
            this.info(`Cockroach (${binary_version}) binary found but outdated, updating to ${Environment.COCKROACH_VERSION}...`);

            // -- Remove outdated binary
            this.info(`Removing outdated Cockroach binary...`);
            try {
                await fs.rm(`bin/cockroach-${binary_version}`, { recursive: true });
            }
            catch (error) {
                this.error(`Error removing outdated Cockroach binary: ${error}`);
                exit(1);
            }

            // -- Download new binary
            this.info(`Downloading new Cockroach binary...`);
            try {
                await promisify(exec)(`wget ${Environment.COCKROACH_DOWNLOAD} -O data/tmp/cockroach.tgz`);
            }
            catch (error) {
                this.error(`Error downloading Cockroach binary: ${error}`);
                exit(1);
            }

            // -- Extract new binary
            this.info(`Extracting new Cockroach binary...`);
            try {
                await fs.mkdir(`bin/cockroach-${Environment.COCKROACH_VERSION}`);
                await promisify(exec)(`tar -xzf data/tmp/cockroach.tgz -C bin/cockroach-${Environment.COCKROACH_VERSION} --strip-components=1`);
            }
            catch (error) {
                this.error(`Error extracting Cockroach binary: ${error}`);
                exit(1);
            }

            // -- Remove downloaded archive
            this.info(`Removing downloaded Cockroach archive...`);
            try {
                await fs.rm(`data/tmp/cockroach.tgz`);
            }
            catch (error) {
                this.error(`Error removing downloaded Cockroach archive: ${error}`);
                exit(1);
            }

            // -- Give execute permission to new the binary
            this.info(`Giving execute permission to the new Cockroach binary...`);
            try {
                await promisify(exec)(`chmod +x bin/cockroach-${Environment.COCKROACH_VERSION}/cockroach`);
            }
            catch (error) {
                this.error(`Error giving execute permission to new Cockroach binary: ${error}`);
                exit(1);
            }

        }


        // - Binary does not exist
        else {
            this.info(`No Cockroach binary found, downloading version ${Environment.COCKROACH_VERSION}...`);

            // -- Download new binary
            this.info(`Downloading Cockroach binary...`);
            try {
                await promisify(exec)(`wget ${Environment.COCKROACH_DOWNLOAD} -O data/tmp/cockroach.tgz`);
            }
            catch (error) {
                this.error(`Error downloading Cockroach binary: ${error}`);
                exit(1);
            }

            // -- Extract new binary
            this.info(`Extracting Cockroach binary...`);
            try {
                await fs.mkdir(`bin/cockroach-${Environment.COCKROACH_VERSION}`);
                await promisify(exec)(`tar -xzf data/tmp/cockroach.tgz -C bin/cockroach-${Environment.COCKROACH_VERSION} --strip-components=1`);
            }
            catch (error) {
                this.error(`Error extracting Cockroach binary: ${error}`);
                exit(1);
            }

            // -- Remove downloaded archive
            this.info(`Removing downloaded Cockroach archive...`);
            try {
                await fs.rm(`data/tmp/cockroach.tgz`);
            }
            catch (error) {
                this.error(`Error removing downloaded Cockroach archive: ${error}`);
                exit(1);
            }

            // -- Give execute permission to the binary
            this.info(`Giving execute permission to the Cockroach binary...`);
            try {
                await promisify(exec)(`chmod +x bin/cockroach-${Environment.COCKROACH_VERSION}/cockroach`);
            }
            catch (error) {
                this.error(`Error giving execute permission to Cockroach binary: ${error}`);
                exit(1);
            }

        }
    }

    private startup(): void {

        if (this.mode == "single") {

            this.info(`Starting CockroachDB in single-node mode...`);

            this.process = spawn(`bin/cockroach-${Environment.COCKROACH_VERSION}/cockroach`,
                [
                    `start-single-node`,
                    `--certs-dir=data/cockroach-certs`,
                    `--store=data/cockroach-single`,
                    `--listen-addr=localhost`,
                ]
            );

            this.process!.stdout!.on(`data`, (data) => this.onOutput(data));
            this.process!.stderr!.on(`data`, (data) => this.onError(data));

        }

    }

    private onOutput(data: any): void {
        (data.toString() as string).split('\n').forEach(
            (line) => {

                if (line.trim().length > 0)
                    this.info(`> ${line}`);
            }
        );
    }

    private onError(data: any): void {
        (data.toString() as string).split('\n').forEach(
            (line) => {
                if (line.trim().length > 0)
                    this.error(`> ${line}`);
            }
        );
    }

    private async monitor(): Promise<void> {

        try {
            await fetch(`http://localhost:8080/health`);
            if (this.status != "running") {
                Daemon.eventBus.emit("cockroach:running");
                this.info(`CockroachDB is up and healthy.`);
            }
            this.status = "running";
        }
        catch (e) {
            if (this.status != "stopped")
                Daemon.eventBus.emit("cockroach:stopped");
            this.status = "stopped";
        }

    }

    protected info(message: string): void {
        console.info(`\x1b[35m[CockroachDaemon]\x1b[0m ${message}`);
    }

    protected error(message: string): void {
        console.error(`\x1b[35m[CockroachDaemon]\x1b[0m \x1b[31m${message}\x1b[0m`);
    }

}