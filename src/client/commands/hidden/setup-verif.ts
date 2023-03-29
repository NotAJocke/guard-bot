import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	type GuildMember,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { type SlashCommand } from "../../models/slash-commands";

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
			const embed = new EmbedBuilder()
				.setTitle("Clique ici pour avoir l'accès au serveur")
				.setColor("Green");
			targetChannel.send({ embeds: [embed], components: [actionRow] });
			interaction.reply({ content: "Envoyé", ephemeral: true });
		}
	},

	async execButtons(interaction, buttonId, client) {
		switch (buttonId) {
			case "verif-btn":
				const roleId = client.getConfig().roles.communityRoleVerified;
				const role = interaction.guild!.roles.cache.get(roleId);
				if (role != null) {
					if (!(<GuildMember>interaction.member!).roles.cache.has(roleId)) {
						(<GuildMember>interaction.member!).roles.add(role);
						interaction.reply({
							content: "Vous avez été verifié",
							ephemeral: true,
						});
					} else {
						interaction.reply({
							content: "Vous avez déjà accepté le règlement",
							ephemeral: true,
						});
					}
				}

				break;
		}
	},

	settings: {
		enabled: true,
	},
};

export default command;
