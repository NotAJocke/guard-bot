import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../models/slash-commands";

const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("setup-verif")
		.setDescription("Setup the verification system")
		.addChannelOption((option) => {
			return option
				.setName("channel")
				.setDescription(
					"The channel where the verification message will be sent"
				)
				.setRequired(true);
		})
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async exec(interaction: ChatInputCommandInteraction) {
		const channel = interaction.options.getChannel("channel")!;

		const targetChannel = interaction.guild?.channels.cache.get(channel.id);
		const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("setup-verif_verif-btn")
				.setEmoji("✅")
				.setLabel("Verification")
				.setStyle(ButtonStyle.Secondary)
		);

		if (targetChannel?.isTextBased()) {
			targetChannel.send({ content: "Test", components: [actionRow] });
			interaction.reply({ content: "Sent", ephemeral: true });
		}
	},

	async execButtons(interaction, buttonId) {
		switch (buttonId) {
			case "verif-btn":
				interaction.reply({ content: "You got verified", ephemeral: true });
				break;
		}
	},

	settings: {
		enabled: true,
	},
};

export default command;
