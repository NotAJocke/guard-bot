import { GatewayIntentBits } from "discord.js";
import Config from "../models/config";

const config: Config = {
	intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds],
	testGuildId: "704412119847796856",
	loggingChannels: {
		ban: {
			name: "",
			id: "",
		},
	},
};

export default config;
