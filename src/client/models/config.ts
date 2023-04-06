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
}

export default Config;
