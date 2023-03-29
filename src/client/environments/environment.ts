import { GatewayIntentBits } from "discord.js";
import type Config from "../models/config";

const config: Config = {
	intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds],
	guildId: "704412119847796856",
	loggingChannels: {
		ban: {
			name: "logs",
			id: "1068174411590541322",
		},
	},
	roles: {
		communityRoleVerified: "1062091468401021011",
		moderatorId: "1090267420222050344",
		testingModId: "1090267494633197649",
	},
};

export default config;
