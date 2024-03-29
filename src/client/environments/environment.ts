import { GatewayIntentBits } from "discord.js";
import type Config from "../models/config";

const config: Config = {
	intents: [
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessages,
	],
	guildId: "704412119847796856",
	loggingChannels: {
		ban: {
			name: "logs",
			id: "1068174411590541322",
		},
	},
	embedsColor: "#00B700",
};

export default config;
