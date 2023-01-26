import { GatewayIntentBits } from "discord.js";
import Config from "../models/config";

const config: Config = {
	intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds],
	guildId: "704412119847796856",
	loggingChannels: {
		ban: {
			name: "logs",
			id: "1068174411590541322",
		},
	},
	communityRoleVerified: "1062091468401021011",
};

export default config;
