import { GatewayIntentBits } from "discord.js";

interface Config {
	intents: GatewayIntentBits[];
	testGuildId?: string;
	loggingChannels: {
		ban: {
			name: string;
			id: string;
		};
	};
}

export default Config;
