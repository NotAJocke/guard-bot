import { Interaction } from "discord.js";
import { Client } from "../models/client";
import { Event } from "../models/Event";

export const event: Event = {
	async exec(client: Client, interaction: Interaction) {
		if (interaction.isChatInputCommand()) {
			let commandName = interaction.commandName;
			let command = client
				.getSlashCommands()
				.find((cmd) => cmd.data.name == commandName);
			if (command) {
				command.exec(interaction);
			}
		} else if (interaction.isUserContextMenuCommand()) {
			let commandName = interaction.commandName;
			let command = client
				.getContextMenus()
				.find((cmd) => cmd.data.name == commandName);
			if (command) {
				command.exec(interaction);
			}
		} else if (interaction.isButton()) {
			let interactionData = interaction.customId.split("_");
			let commandName = interactionData[0];
			let buttonId = interactionData[1];

			let command = client
				.getSlashCommands()
				.find((cmd) => cmd.data.name == commandName);
			if (command && command.execButtons) {
				command.execButtons(interaction, buttonId);
			}
		
		} else if (interaction.isContextMenuCommand()) {
			let commandName = interaction.commandName;

			let command = client
				.getContextMenus()
				.find((cmd) => cmd.data.name == commandName);

			if (command) {
				command.exec(interaction);
			}
		}
	},

	settings: {
		enabled: true,
	},
};

export default event;
