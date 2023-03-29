import { type Client } from "../models/client";
import { type Event } from "../models/event";
import { checkUnbans } from "../utils/checkUnbans";

export const readyEvent: Event = {
	async exec(client: Client) {
		console.log(`Logged in as ${client.user?.tag}!`);
		if (process.env.PRODUCTION == "TRUE") {
			console.log("Prod mode");
		}

		if (
			client.getSlashCommands().find((c) => c.data.name == "ban")?.settings
				.enabled
		) {
			console.log("Unban system ready");
			checkUnbans(client);
		}
	},

	settings: {
		enabled: true,
	},
};

export default readyEvent;
