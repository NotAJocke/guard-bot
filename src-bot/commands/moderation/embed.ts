import {
	ChatInputCommandInteraction,
	ColorResolvable,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../models/slash-commands";

const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("embed")
		.setDescription("Créer un embed.")
		.setDMPermission(false)
		.addStringOption((option) => {
			return option
				.setName("description")
				.setDescription("La description de l'embed")
				.setRequired(true);
		})
		.addChannelOption((option) => {
			return option
				.setName("channel")
				.setDescription("Le salon dans lequel envoyer l'embed");
		})
		.addStringOption((option) => {
			return option.setName("titre").setDescription("Le titre de l'embed");
		})
		.addStringOption((option) => {
			return option
				.setName("couleur")
				.setDescription("La couleur de l'embed")
				.addChoices(
					{ name: "blanc", value: "White" },
					{ name: "eau", value: "Aqua" },
					{ name: "vert", value: "Green" },
					{ name: "bleu", value: "Blue" },
					{ name: "jaune", value: "Yellow" },
					{ name: "mauve", value: "Purple" },
					{ name: "rose bizarre", value: "LuminousVividPink" },
					{ name: "fuchsia", value: "Fuchsia" },
					{ name: "or", value: "Gold" },
					{ name: "orange", value: "Orange" },
					{ name: "rouge", value: "Red" },
					{ name: "gris", value: "Grey" },
					{ name: "eau sombre", value: "DarkAqua" },
					{ name: "vert foncé", value: "DarkGreen" },
					{ name: "bleu foncé", value: "DarkBlue" },
					{ name: "violet", value: "DarkPurple" },
					{ name: "or foncé", value: "DarkGold" },
					{ name: "orange foncé", value: "DarkOrange" },
					{ name: "rouge foncé", value: "DarkRed" },
					{ name: "gris foncé", value: "DarkGrey" },
					{ name: "gris un peu plus foncé", value: "DarkerGrey" },
					{ name: "gris clair", value: "LightGrey" },
					{ name: "blurple", value: "Blurple" },
					{ name: "greyple", value: "Greyple" },
					{ name: "noir mais pas noir", value: "DarkButNotBlack" }
				);
		})
		.addStringOption((option) => {
			return option
				.setName("hex")
				.setDescription("Couleur sous format #FFFFFF");
		})
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

	async exec(interaction: ChatInputCommandInteraction) {
		const channelOption = interaction.options.getChannel("channel");
		const titleOption = interaction.options.getString("titre");
		const colorOption = interaction.options.getString("couleur");
		const hexColorOption = interaction.options.getString("hex");
		const descriptionOption = interaction.options.getString("description")!;

		if (colorOption && hexColorOption) {
			return interaction.reply({
				content: "Merci d'utiliser un seul type de couleur.",
				ephemeral: true,
			});
		}

		const embed = new EmbedBuilder()
			.setTitle(titleOption)
			.setDescription(descriptionOption);
		if (colorOption) embed.setColor(colorOption as ColorResolvable);
		if (hexColorOption) embed.setColor(hexColorOption as ColorResolvable);

		if (channelOption) {
			const channel = interaction.guild!.channels.cache.get(channelOption.id);
			if (channel?.isTextBased()) {
				channel.send({
					embeds: [embed],
					allowedMentions: {
						roles: interaction.guild!.roles.cache.map((r) => r.name),
					},
				});
			}
		} else {
			interaction.channel!.send({
				embeds: [embed],
				allowedMentions: {
					roles: interaction.guild!.roles.cache.map((r) => r.name),
				},
			});
		}

		interaction.reply({ content: "Embed envoyé.", ephemeral: true });
	},

	settings: {
		enabled: true,
	},
};

export default command;
