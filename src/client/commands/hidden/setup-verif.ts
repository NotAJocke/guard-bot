import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type GuildMember,
	PermissionFlagsBits,
	SlashCommandBuilder,
	Role,
} from "discord.js";
import { type SlashCommand } from "../../models/slash-commands";
import { Database } from "../../utils/database";
import { Client } from "../../models/client";

const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("setup-verif")
		.setDescription("Setup the verification system")
		.addChannelOption((option) => {
			return option
				.setName("channel")
				.setDescription("Le salon où sera envoyé le bouton de vérification")
				.setRequired(true);
		})
		.addRoleOption((option) => {
			return option
				.setName("role")
				.setDescription("Le role a attribuer aux nouveaux membres")
				.setRequired(true);
		})
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async exec(interaction: ChatInputCommandInteraction, client: Client) {
		const channel = interaction.options.getChannel("channel")!;
		const role = interaction.options.getRole("role") as Role;

		const targetChannel = interaction.guild?.channels.cache.get(channel.id);
		const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("setup-verif_verif-btn")
				.setEmoji("✅")
				.setLabel("Verification")
				.setStyle(ButtonStyle.Secondary)
		);

		if (targetChannel?.isTextBased()) {
			const embed = new EmbedBuilder()
				.setTitle("Clique ici pour avoir l'accès au serveur")
				.setColor(client.getConfig().embedsColor);
			targetChannel.send({ embeds: [embed], components: [actionRow] });
			interaction.reply({ content: "Envoyé", ephemeral: true });

			await Database.updateVerifiedRole(interaction.guildId!, role.id);
		}
	},

	async execButtons(interaction, buttonId, client) {
		switch (buttonId) {
			case "verif-btn":
				////const roleId = client.getConfig().roles.communityRoleVerified;
				const roleId = await Database.getVerifiedRole(interaction.guildId!);
				if (roleId) {
					const role = interaction.guild!.roles.cache.get(roleId);
					if (role != null) {
						if (!(<GuildMember>interaction.member!).roles.cache.has(roleId)) {
							(<GuildMember>interaction.member!).roles.add(role);
							interaction.reply({
								content: "Vous avez été verifié",
								ephemeral: true,
							});
						} else {
							interaction.reply({
								content: "Vous avez déjà accepté le règlement",
								ephemeral: true,
							});
						}
					} else {
						interaction.reply({
							content:
								"Une erreur est survenue, je ne trouve pas le rôle. Merci de signaler ce problème à JockeRider199#2627.",
						});
					}
				} else {
					interaction.reply({
						content:
							"Une erreur est survenue, je ne trouve pas le rôle. Merci de signaler ce problème à JockeRider199#2627.",
					});
				}

				break;
		}
	},

	settings: {
		enabled: true,
	},
};

export default command;
