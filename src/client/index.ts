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

	await client.syncInteractionsForGuild(client.getConfig().guildId, {
		slashCommands: true,
		contextMenus: true,
	});

	if(process.env.PRODUCTION == "TRUE") {
		await client.login(process.env.PROD_CLIENT_TOKEN);
	} else {
		await client.login(process.env.CLIENT_TOKEN)
	}
}

main();
