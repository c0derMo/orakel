import { consola } from "consola";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

export interface PluginMetadata {
    name: string;
    entrypoint: string;
    loaded: boolean;
    error?: Error;
}

const logger = consola.withTag("PluginController");

export default class PluginController {
    private readonly plugins: PluginMetadata[];
    private readonly pluginDir: string;

    constructor(rootDirectory: string) {
        this.plugins = [];
        this.pluginDir = join(rootDirectory, "plugins");
    }

    async findAndLoadPlugins(): Promise<void> {
        await this.findAllPlugins();
        await this.loadAllPlugins();
    }

    async findAllPlugins(): Promise<void> {
        try {
            const directoryContents = await readdir(this.pluginDir, {
                withFileTypes: true,
            });
            logger.debug(
                "Read %s directory, found %d entries",
                this.pluginDir,
                directoryContents.length,
            );
            for (const entry of directoryContents) {
                if (!entry.isDirectory()) {
                    logger.debug("%s: Not a directory", entry.name);
                    continue;
                }
                const plugin: PluginMetadata = {
                    name: entry.name,
                    entrypoint: join(entry.parentPath, entry.name, "index.ts"),
                    loaded: false,
                };
                logger.debug(
                    "Found plugin %s: %s",
                    plugin.name,
                    plugin.entrypoint,
                );
                this.plugins.push(plugin);
            }
        } catch (e) {
            logger.debug("Error while reading plugin directory:");
            logger.debug(e);
        }
    }

    async loadAllPlugins(): Promise<void> {
        for (const plugin of this.plugins) {
            try {
                logger.debug("Trying to load plugin %s", plugin.name);
                await this.loadPlugin(plugin);
                plugin.loaded = true;
                logger.info("Plugin %s loaded successfully.", plugin.name);
            } catch (e: unknown) {
                plugin.loaded = false;
                plugin.error = e as Error;
                logger.error("Plugin %s could not be loaded!", plugin.name);
                logger.error(e);
            }
        }
    }

    async loadPlugin(plugin: PluginMetadata) {
        const defaultExport = (await import(plugin.entrypoint)) as unknown;
        // TODO: Actually do something with the require here
        consola.debug(Object.getOwnPropertyNames(defaultExport));
    }
}
