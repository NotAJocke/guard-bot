import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
	type GuildMember,
	PermissionFlagsBits,
	SlashCommandBuilder,
	Role,
	ChannelType,
	TextChannel,
	ButtonInteraction,
} from "discord.js";
import { type SlashCommand } from "../../models/slash-commands";
import { Database } from "../../utils/database";
import { Client } from "../../models/client";

const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("verification")
		.setDescription("Système de verification des nouveaux membres")
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("setup")
				.setDescription("Setup du système de vérification")
				.addChannelOption((option) => {
					return option
						.setName("channel")
						.setDescription("Le salon où sera envoyé le bouton de vérification")
						.addChannelTypes(ChannelType.GuildText)
						.setRequired(true);
				})
				.addRoleOption((option) => {
					return option
						.setName("role")
						.setDescription("Le role a attribuer aux nouveaux membres")
						.setRequired(true);
				});
		})
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("pass")
				.setDescription("Force le passage d'un utilisateur")
				.addUserOption((option) => {
					return option
						.setName("membre")
						.setDescription("Le membre a vérifier")
						.setRequired(true);
				});
		})
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

	async exec(interaction: ChatInputCommandInteraction, client: Client) {
		const command = interaction.options.getSubcommand();
		if (command == "setup") {
			const channelOption = interaction.options.getChannel(
				"channel"
			) as TextChannel;
			const roleOption = interaction.options.getRole("role") as Role;

			const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId("verification_verif-btn")
					.setEmoji("✅")
					.setLabel("Verification")
					.setStyle(ButtonStyle.Secondary)
			);

			const embed = new EmbedBuilder()
				.setTitle("Clique ici pour avoir l'accès au serveur")
				.setColor(client.getConfig().embedsColor);
			channelOption.send({ embeds: [embed], components: [actionRow] });
			interaction.reply({ content: "Envoyé", ephemeral: true });

			await Database.updateVerifiedRole(interaction.guildId!, roleOption.id);
		} else if (command == "pass") {
			const memberOption = interaction.options.getMember(
				"membre"
			) as GuildMember;
			await verifMember(interaction, memberOption);
		}
	},

	async execButtons(interaction, buttonId, client) {
		switch (buttonId) {
			case "verif-btn":
				await verifMember(interaction, <GuildMember>interaction.member);
				break;
		}
	},

	settings: {
		enabled: true,
	},
};

async function verifMember(
	interaction: ChatInputCommandInteraction | ButtonInteraction,
	member: GuildMember
) {
	const roleId = await Database.getVerifiedRole(interaction.guildId!);
	if (roleId) {
		const role = interaction.guild!.roles.cache.get(roleId);
		if (role != null) {
			if (!member.roles.cache.has(roleId)) {
				member.roles.add(role);
				if (interaction instanceof ChatInputCommandInteraction) {
					return interaction.reply({
						content: `${member} a été vérifié.`,
						ephemeral: true,
					});
				} else {
					return interaction.reply({
						content: "Vous avez été verifié",
						ephemeral: true,
					});
				}
			} else {
				if (interaction instanceof ChatInputCommandInteraction) {
					return interaction.reply({
						content: `${member} est déjà vérifié.`,
						ephemeral: true,
					});
				} else {
					return interaction.reply({
						content: "Vous avez déjà accepté le règlement",
						ephemeral: true,
					});
				}
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
}

export default command;
