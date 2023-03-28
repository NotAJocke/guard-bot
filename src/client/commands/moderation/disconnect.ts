import {
	type ChatInputCommandInteraction,
	type GuildMember,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { type SlashCommand } from "../../models/slash-commands";

const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("disconnect")
		.setDescription("Déconnecte un membre du salon vocal")
		.addUserOption((option) => {
			return option
				.setName("membre")
				.setDescription("Le membre a déconnecter.")
				.setRequired(true);
		})
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers),

	async exec(interaction: ChatInputCommandInteraction) {
		const memberOption = interaction.options.getMember(
			"membre"
		)! as GuildMember;
		const member = interaction.guild?.members.cache.get(memberOption.id);

		try {
			member?.voice.disconnect();
			interaction.reply({
				content: `${member} a été déconnecté`,
				ephemeral: true,
			});
		} catch {
			interaction.reply({
				content: "Une erreur est survenue",
				ephemeral: true,
			});
		}
	},

	settings: {
		enabled: false,
	},
};

export default command;
