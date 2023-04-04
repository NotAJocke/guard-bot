import {
	ChannelType,
	EmbedBuilder,
	type GuildMember,
	PermissionFlagsBits,
} from "discord.js";
import { type Client } from "../models/client";
import { type Event } from "../models/event";
import { Database } from "../utils/database";

export const event: Event = {
	async exec(client: Client, member: GuildMember) {
		const guildData = await Database.getOrCreateGuild(member.guild.id);

		if (guildData.raidmode) {
			const perm = member.guild.members.me?.permissions.has(
				PermissionFlagsBits.KickMembers
			);
			if (!perm) {
				warnLogs("Missing Permissions");
			}

			member.user
				.send(
					"Le serveur est momentanément injoignable, veuillez réessayer plus tard."
				)
				.catch((_) => {});
			member.kick("Raidmode activated.").catch((err) => {
				warnLogs(err.message);
			});
		}

		function warnLogs(message: string) {
			const logChannel = member.guild.channels.cache.get(
				client.getConfig().loggingChannels.ban.id
			);

			if (logChannel != null && logChannel.type == ChannelType.GuildText) {
				logChannel.send({
					embeds: [
						new EmbedBuilder()
							.setTitle("Raidmode failure")
							.setColor("Red")
							.setDescription(
								`Le mode raid est __activé__ mais une erreur s'est produite: ${message}\n\n:warning: ${member} (${member.user.id}) est arrivé sur le serveur durant le raid`
							)
							.setThumbnail(member.user.displayAvatarURL())
							.setTimestamp(),
					],
				});
			}
		}
	},

	settings: {
		enabled: false,
	},
};

export default event;
