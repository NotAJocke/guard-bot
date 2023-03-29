import { GatewayIntentBits } from "discord.js";
import type Config from "../models/config";

const config: Config = {
	intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds],
	loggingChannels: {
		ban: {
			name: "",
			id: "",
		},
	},
	guildId: "1022906024816017510",
	roles: {
		communityRoleVerified: "1023342162882068480",
		moderatorId: "",
		testingModId: "",
	},
};

export default config;
