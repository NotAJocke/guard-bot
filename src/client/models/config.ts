import { type GatewayIntentBits } from "discord.js";

interface Config {
	intents: GatewayIntentBits[];
	guildId: string;
	loggingChannels: {
		ban: {
			name: string;
			id: string;
		};
	};
	communityRoleVerified: string;
}

export default Config;
