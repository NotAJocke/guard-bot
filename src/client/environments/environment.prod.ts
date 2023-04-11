import { GatewayIntentBits } from "discord.js";
import type Config from "../models/config";

const config: Config = {
	intents: [
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessages,
	],
	loggingChannels: {
		ban: {
			name: "",
			id: "",
		},
	},
	guildId: "1022906024816017510",
	embedsColor: "#00B700",
};

export default config;
