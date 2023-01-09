import { config as envConfig } from "dotenv";

import { Client } from "./models/client";
import { Database } from "./utils/database";

envConfig();
const client = new Client();

async function main(): Promise<void> {
	await client.loadEvents();
	await client.loadSlashCommands();
	await client.loadContextMenus();
	await Database.init();

	if (process.env.CACHE === "clear") {
		console.log("Resetting cache");
		await client.unSyncInteractions();
	}

	if (process.env.PRODUCTION == "TRUE") {
		await client.syncGlobalInteractions({
			slashCommands: true,
			contextMenus: true,
		});
	} else {
		await client.syncInteractionsForGuild(client.getConfig().testGuildId!, {
			slashCommands: true,
			contextMenus: true,
		});
	}
	await client.login(process.env.CLIENT_TOKEN);
}

main();
