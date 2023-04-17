import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CategoryChannel,
	ChannelType,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type ModalActionRowComponentBuilder,
	ModalBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
	type TextChannel,
	TextInputBuilder,
	TextInputStyle,
	GuildMember,
	Role,
} from "discord.js";
import { type SlashCommand } from "../../models/slash-commands";
import { Database } from "../../utils/database";
import { Client } from "../../models/client";

const command: SlashCommand = {
	settings: {
		enabled: true,
	},

	data: new SlashCommandBuilder()
		.setName("ticket")
		.setDescription("Système de tickets")
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("setup")
				.setDescription("Setup du système de tickets")
				.addChannelOption((option) => {
					return option
						.setName("category")
						.setDescription("Catégorie où créer les tickets")
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildCategory);
				})
				.addChannelOption((option) => {
					return option
						.setName("channel")
						.setDescription("Channel où envoyer le message")
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildText);
				})
				.addRoleOption((option) => {
					return option
						.setName("role")
						.setDescription("Le role staff")
						.setRequired(true);
				});
		})
		.addSubcommand((subcommand) => {
			return subcommand.setName("close").setDescription("Fermer un ticket");
		})
		.addSubcommand((subcommand) => {
			return subcommand
				.setName("add")
				.setDescription("Ajouter une personne au ticket")
				.addUserOption((option) => {
					return option
						.setName("membre")
						.setDescription("La personne à rajouter")
						.setRequired(true);
				});
		})
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

	async exec(interaction: ChatInputCommandInteraction, client: Client) {
		if (interaction.options.getSubcommand() === "setup") {
			const channelOption = interaction.options.getChannel(
				"channel"
			) as TextChannel;
			const categoryOption = interaction.options.getChannel(
				"category"
			) as CategoryChannel;
			const roleOption = interaction.options.getRole("role") as Role;

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId("ticket_create")
					.setLabel("Créer un ticket")
					.setEmoji("📩")
					.setStyle(ButtonStyle.Secondary)
			);
			const embed = new EmbedBuilder()
				.setTitle("Pour contacter notre équipe, veuillez créer un ticket.")
				.setColor(client.getConfig().embedsColor)
				.setDescription(
					"Cliquez sur le bouton :envelope_with_arrow: ci-dessous pour créer un ticket."
				);

			channelOption.send({ embeds: [embed], components: [row] });
			interaction.reply({
				content: `Message envoyé dans ${channelOption}`,
				ephemeral: true,
			});

			await Database.createTicketConfig(
				interaction.guildId!,
				roleOption.id,
				categoryOption.id
			);
		} else if (interaction.options.getSubcommand() == "close") {
			if (
				await Database.isTicket(interaction.guildId!, interaction.channelId)
			) {
				await Database.removeTicket(
					interaction.guildId!,
					interaction.channelId
				);
				const channel = interaction.channel as TextChannel;
				await channel.delete();
			} else {
				interaction.reply({
					content: "Ce salon n'est pas un ticket",
					ephemeral: true,
				});
			}
		} else if (interaction.options.getSubcommand() == "add") {
			if (
				await Database.isTicket(interaction.guildId!, interaction.channelId)
			) {
				const memberOption = interaction.options.getMember(
					"membre"
				) as GuildMember;
				const channel = interaction.channel as TextChannel;
				channel.permissionOverwrites.create(memberOption, {
					ViewChannel: true,
				});
				interaction.reply({
					content: `${memberOption} a été ajouté au ticket.`,
					ephemeral: true,
				});
			}
		}
	},

	async execButtons(interaction, buttonId, client) {
		switch (buttonId) {
			case "create": {
				if (
					await Database.isAlreadyInTicket(
						interaction.guildId!,
						interaction.user.id
					)
				) {
					return await interaction.reply({
						content: "Vous avez déjà un ticket ouvert.",
						ephemeral: true,
					});
				}
				const form = new ModalBuilder()
					.setTitle("Création d'un ticket")
					.setCustomId("ticket_form");

				const row1 =
					new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("sujet")
							.setLabel("Sujet du ticket")
							.setPlaceholder("Décrivez votre problème en quelques mots.")
							.setMinLength(3)
							.setMaxLength(50)
							.setStyle(TextInputStyle.Short)
							.setRequired(true)
					);
				const row2 =
					new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId("description")
							.setLabel("Description du ticket")
							.setPlaceholder("Donnez nous plus de détails sur votre problème.")
							.setMinLength(15)
							.setMaxLength(1000)
							.setStyle(TextInputStyle.Paragraph)
							.setRequired(true)
					);

				form.addComponents(row1, row2);
				await interaction.showModal(form);
				break;
			}
			case "close-req": {
				if (
					await Database.isTicket(interaction.guildId!, interaction.channelId)
				) {
					let row = new ActionRowBuilder<ButtonBuilder>().setComponents(
						new ButtonBuilder()
							.setCustomId("ticket_close")
							.setLabel("Confirmer")
							.setStyle(ButtonStyle.Primary)
					);
					interaction.reply({
						content: "Êtes-vous sûr de vouloir fermer ce ticket ?",
						components: [row],
					});
				} else {
					interaction.reply({
						content: "Ce salon n'est pas un ticket",
						ephemeral: true,
					});
				}
				break;
			}
			case "close": {
				if (
					await Database.isTicket(interaction.guildId!, interaction.channelId)
				) {
					await interaction.message.delete();
					await Database.closeTicket(
						interaction.guildId!,
						interaction.channelId
					);
					const channel = interaction.channel as TextChannel;
					const modRoleId = await Database.getTicketModRoleId(
						interaction.guildId!
					);
					await channel.permissionOverwrites.set([
						{
							id: interaction.guild!.roles.everyone.id,
							deny: [PermissionFlagsBits.ViewChannel],
						},
						{
							id: modRoleId,
							allow: [
								PermissionFlagsBits.ViewChannel,
								PermissionFlagsBits.AttachFiles,
								PermissionFlagsBits.SendMessages,
							],
						},
					]);
					const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
						new ButtonBuilder()
							.setCustomId("ticket_delete")
							.setLabel("Supprimer")
							.setStyle(ButtonStyle.Danger),
						new ButtonBuilder()
							.setCustomId("ticket_open")
							.setLabel("Réouvrir")
							.setStyle(ButtonStyle.Primary)
					);
					interaction.reply({ content: "Ticket fermé.", components: [row] });
				} else {
					interaction.reply({
						content: "Ce salon n'est pas un ticket",
						ephemeral: true,
					});
				}
				break;
			}
			case "delete": {
				await Database.removeTicket(
					interaction.guildId!,
					interaction.channelId
				);
				const channel = interaction.channel as TextChannel;
				await channel.delete();
				break;
			}
			case "open": {
				await interaction.message.delete();
				const ownerId = await Database.openTicket(
					interaction.guildId!,
					interaction.channelId
				);
				await (<TextChannel>interaction.channel).permissionOverwrites.create(
					ownerId,
					{
						ViewChannel: true,
						SendMessages: true,
						AttachFiles: true,
					}
				);
				interaction.reply({ content: "Ticket réouvert", ephemeral: true });
				break;
			}
		}
	},

	async execModals(interaction, modalId, client) {
		switch (modalId) {
			case "form":
				const ticketNumber = await Database.increaseTicketCount(
					interaction.guildId!
				);
				const modRoleId = await Database.getTicketModRoleId(
					interaction.guildId!
				);
				const channel = await interaction.guild!.channels.create({
					name: `ticket-${ticketNumber}`,
					type: ChannelType.GuildText,
					parent: await Database.getTicketCategory(interaction.guildId!),
					permissionOverwrites: [
						{
							id: interaction.guild!.roles.everyone.id,
							deny: [PermissionFlagsBits.ViewChannel],
						},
						{
							id: modRoleId,
							allow: [
								PermissionFlagsBits.ViewChannel,
								PermissionFlagsBits.SendMessages,
								PermissionFlagsBits.AttachFiles,
							],
						},
						{
							id: interaction.member!.user.id,
							allow: [
								PermissionFlagsBits.ViewChannel,
								PermissionFlagsBits.SendMessages,
								PermissionFlagsBits.AttachFiles,
							],
						},
					],
				});
				interaction.reply({
					content: `Ticket créé avec succès. ( ${channel} )`,
					ephemeral: true,
				});
				Database.createTicket(
					interaction.guildId!,
					channel.id,
					interaction.user.id
				);

				const embed = new EmbedBuilder()
					.setColor(client.getConfig().embedsColor)
					.setAuthor({
						name: interaction.user.tag,
						iconURL: interaction.user.displayAvatarURL(),
					})
					.setTitle(
						`**Sujet:** ${interaction.fields.getTextInputValue("sujet")}`
					)
					.setDescription(
						`**Description:** ${interaction.fields.getTextInputValue(
							"description"
						)}`
					)
					.setFooter({
						text: "Patientez un instant, notre équipe se charge de vous",
					})
					.setTimestamp();

				const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId("ticket_close-req")
						.setLabel("Fermer")
						.setEmoji("🔒")
						.setStyle(ButtonStyle.Secondary)
				);

				const toPin = await channel.send({
					content: `<@&${modRoleId}>`,
					embeds: [embed],
					components: [row],
				});
				await toPin.pin();
				break;
		}
	},
};

export default command;
