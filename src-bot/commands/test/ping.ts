import {
	EmbedBuilder,
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} from "discord.js";
import { SlashCommand } from "../../models/slash-commands";

const slashCommand: SlashCommand = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Test"),

	async exec(interaction: ChatInputCommandInteraction) {
		let embed = new EmbedBuilder({
			title: "Test",
			fields: [{ name: "Reply", value: "Pong !" }],
		});

		let row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("ping_btn")
				.setLabel("Try")
				.setStyle(ButtonStyle.Primary)
		);

		interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
	},

	async execButtons(interaction, buttonId) {
		switch (buttonId) {
			case "btn":
				interaction.reply({ content: "Hello World 2", ephemeral: true });
				break;
		}
	},

	settings: {
		enabled: true,
	},
};

export default slashCommand;
