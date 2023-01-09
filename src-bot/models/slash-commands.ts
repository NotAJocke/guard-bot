import { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";
import { Client } from "./client";

export interface SlashCommand {
	data: any;

	exec(interaction: ChatInputCommandInteraction): void;

	execButtons?(
		interaction: ButtonInteraction,
		buttonId: string,
		client: Client
	): void;

	settings: {
		enabled: boolean;
	};
}
