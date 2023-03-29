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
	roles: {
		communityRoleVerified: string;
		moderatorId: string;
		testingModId: string;
	};
}

export default Config;
