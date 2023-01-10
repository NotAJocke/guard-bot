import { GatewayIntentBits } from "discord.js";
import Config from "../models/config";

const config: Config = {
	intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds],
	loggingChannels: {
		ban: {
			name: "",
			id: "",
		},
	},
	communityRoleVerified: "1023342162882068480",
	guildId: "1022906024816017510",
};

export default config;
