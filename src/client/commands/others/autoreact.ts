import {
	ChannelType,
	ChatInputCommandInteraction,
	GuildEmoji,
	MessageReaction,
	PermissionFlagsBits,
	SlashCommandBuilder,
	TextChannel,
	User,
} from "discord.js";
import { SlashCommand } from "../../models/slash-commands";
import { Database } from "../../utils/database";
import { isNumber } from "../../utils/utils";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},

	data: new SlashCommandBuilder()
		.setName("autoreact")
		.setDescription("Commandes d'auto-react")
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("add")
				.setDescription("Ajoute un système d'auto react dans un salon")
				.addChannelOption((option) => {
					return option
						.setName("channel")
						.setDescription("Le salon où réagir")
						.addChannelTypes(ChannelType.GuildText)
						.setRequired(true);
				});
		})
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("remove")
				.setDescription("Retire le système d'auto react dans un salon")
				.addChannelOption((option) => {
					return option
						.setName("channel")
						.setDescription("Le salon")
						.addChannelTypes(ChannelType.GuildText)
						.setRequired(true);
				});
		}),

	exec: async (interaction: ChatInputCommandInteraction) => {
		const channelOption = interaction.options.getChannel(
			"channel"
		) as TextChannel;
		const subcommand = interaction.options.getSubcommand();

		if (subcommand == "add") {
			const res = await interaction.reply({
				content:
					"Réagissez sous ce message avec les réactions souhaitées. Une fois terminé pressez :incoming_envelope:",
			});
			const msg = await res.fetch();

			await msg.react("📨");
			const collector = msg.createReactionCollector({
				filter: (r: MessageReaction, u: User) => u.id == interaction.user.id,
				dispose: true,
			});

			let emojis: string[] = [];
			collector.on("collect", (r: MessageReaction) => {
				switch (r.emoji.name) {
					case "📨":
						if (emojis.length < 1) {
							msg.delete();
							return msg.channel
								.send({ content: "Annulation." })
								.then((m) => setTimeout(() => m.delete(), 4000));
						}
						collector.stop();
						msg.delete();
						Database.setAutoReactChannel(
							interaction.guildId!,
							channelOption.id,
							emojis
						);
						msg.channel.send({
							content: `Je réagirais désormais aux messages dans le salon ${channelOption} avec: ${emojis
								.map((e) =>
									isNumber(e) ? interaction.guild!.emojis.cache.get(e) : e
								)
								.join(" ")}`,
						});
						break;
					default:
						if (r.emoji instanceof GuildEmoji) {
							emojis.push(r.emoji.id);
						} else {
							emojis.push(r.emoji.name!);
						}
						break;
				}
			});
			collector.on("remove", (r: MessageReaction) => {
				if (r.emoji instanceof GuildEmoji) {
					if (emojis.some((e) => e == r.emoji.id)) {
						emojis = emojis.filter((e) => e != r.emoji.id);
					}
				} else {
					if (emojis.some((e) => e == r.emoji.name!)) {
						emojis = emojis.filter((e) => e != r.emoji.name!);
					}
				}
			});
		} else if (subcommand == "remove") {
			if (
				await Database.isAutoReactChannel(
					interaction.guildId!,
					channelOption.id
				)
			) {
				await Database.deleteAutoReactChannel(
					interaction.guildId!,
					channelOption.id
				);
				interaction.reply({
					content: "Supprimé avec succès.",
					ephemeral: true,
				});
			} else {
				interaction.reply({ content: "Ce salon n'est pas configuré." });
			}
		}
	},
};

export default command;
