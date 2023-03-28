import {
	type ButtonInteraction,
	type ContextMenuCommandInteraction,
} from "discord.js";

export interface ContextMenu {
	data: any;

	exec(interaction: ContextMenuCommandInteraction): void;

	execButtons?(interaction: ButtonInteraction, buttonId: string): void;

	settings: {
		enabled: boolean;
	};
}
