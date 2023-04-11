import { Client, Message } from "discord.js";
import { Event } from "../models/event";
import { Database } from "../utils/database";
import { isNumber } from "../utils/utils";

const event: Event = {
	settings: {
		enabled: true,
	},

	exec: async (_: Client, msg: Message) => {
		if (!msg.guild) return;

		if (await Database.isAutoReactChannel(msg.guildId!, msg.channelId)) {
			const emojis = await Database.getAutoReactEmoji(
				msg.guildId!,
				msg.channelId
			);
			for (const emoji of emojis) {
				if (isNumber(emoji)) {
					const e = msg.guild.emojis.cache.find((e) => e.id == emoji);
					if (e) await msg.react(e);
				} else {
					await msg.react(emoji);
				}
			}
		}
	},
};

export default event;
