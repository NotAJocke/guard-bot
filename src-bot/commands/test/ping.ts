import {
	EmbedBuilder,
	ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../models/slash-commands";

const slashCommand: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Developer data"),

	async exec(interaction: ChatInputCommandInteraction) {
		let embed = new EmbedBuilder()
			.setAuthor({
				name: interaction.client.user.username,
				iconURL: interaction.client.user.displayAvatarURL(),
			})
			.setTitle("Developer data")
			.addFields([
				{
					name: "Latency",
					value: `${Date.now() - interaction.createdTimestamp}ms`,
				},
				{
					name: "API Ping",
					value: `${Math.round(interaction.client.ws.ping)}ms`,
				},
				{
					name: "Uptime",
					value: `${Math.floor(
						interaction.client.uptime / (60 * 1000 * 60 * 24)
					)} days`,
				},
				{
					name: "Memory usage",
					value: `${Math.round(
						process.memoryUsage().heapUsed / 1024 / 1024
					)}mb`,
				},
			]);

		interaction.reply({ embeds: [embed], ephemeral: true });
	},

	settings: {
		enabled: true,
	},
};

export default slashCommand;
