import {
	type ButtonInteraction,
	type ChatInputCommandInteraction,
	type ModalSubmitInteraction,
} from "discord.js";
import { type Client } from "./client";

export interface SlashCommand {
	data: any;

	exec: (interaction: ChatInputCommandInteraction, client: Client) => void;

	execButtons?: (
		interaction: ButtonInteraction,
		buttonId: string,
		client: Client
	) => void;

	execModals?: (
		interaction: ModalSubmitInteraction,
		modalId: string,
		client: Client
	) => void;

	settings: {
		enabled: boolean;
	};
}
