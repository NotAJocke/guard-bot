import { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";

export interface SlashCommand {
	data: any;

	exec(interaction: ChatInputCommandInteraction): void;

	execButtons?(interaction: ButtonInteraction, buttonId: string): void;

	settings: {
		enabled: boolean;
	};
}
