import {
	ContextMenuCommandBuilder,
	ApplicationCommandType,
	MessageContextMenuCommandInteraction,
} from "discord.js";
import { type ContextMenu } from "../models/context-menu";

const contextMenu: ContextMenu = {
	data: new ContextMenuCommandBuilder()
		.setName("flag-msg")
		.setType(ApplicationCommandType.Message),

	async exec(interaction: MessageContextMenuCommandInteraction) {
		interaction.reply({
			content: "Flagged message: " + interaction.targetMessage.content,
			ephemeral: true,
		});
	},

	settings: {
		enabled: false,
	},
};

export default contextMenu;
