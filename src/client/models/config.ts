import { ColorResolvable, type GatewayIntentBits } from "discord.js";

interface Config {
	intents: GatewayIntentBits[];
	guildId: string;
	loggingChannels: {
		ban: {
			name: string;
			id: string;
		};
	};
	embedsColor: ColorResolvable;
}

export default Config;
