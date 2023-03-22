import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	PermissionFlagsBits,
	GuildMember,
	TextChannel,
} from "discord.js";
import { SlashCommand } from "../../models/slash-commands";
import { Report } from "../../models/report";
import ms from "ms";
import { Database } from "../../utils/database";

const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("ban")
		.setDescription("Ban d'un membre du serveur.")
		.setDMPermission(false)
		.addUserOption((option) => {
			return option
				.setName("membre")
				.setDescription("Le membre à bannir")
				.setRequired(true);
		})
		.addStringOption((option) => {
			return option
				.setName("raison")
				.setDescription("La raison du bannissement")
				.setRequired(true);
		})
		.addStringOption((option) => {
			return option.setName("temps").setDescription("Temps de bannissement");
		})
		.addChannelOption((option) => {
			return option
				.setName("channel")
				.setDescription("Le salon d'où tirer des logs");
		})
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	async exec(interaction: ChatInputCommandInteraction) {
		const memberOption = interaction.options.getMember(
			"membre"
		)! as GuildMember;
		const reasonOption = interaction.options.getString("raison")!;
		const timeOption = interaction.options.getString("temps");
		const channelOption = interaction.options.getChannel("channel");

		const member = interaction.guild!.members.cache.get(memberOption.id);

		if (!member) {
			return interaction.reply({
				content: "Malheureusement je ne trouve pas cet utilisateur.",
				ephemeral: true,
			});
		}

		try {
			let clientMember = interaction.client.guilds.cache.get(member.guild.id);
			let power = clientMember!.roles.highest.comparePositionTo(
				member.roles.highest
			);

			if (power <= 0) {
				throw Error("PermissionsIssue");
			}

			interaction.guild?.bans.create(member, {
				reason: reasonOption,
				deleteMessageSeconds: 7,
			});

			if(timeOption) {
				await Database.tempBanMember(member.id, member.guild.id, ms(timeOption), interaction.member!.user.username, reasonOption)
			}

			if (channelOption && channelOption instanceof TextChannel) {
				let fetch = await channelOption.messages.fetch();
				let messages = fetch
					.filter((m) => m.author.id === member.id)
					.first(30)
					.reverse()
					.map((m) => m.content);
				
				await Database.banMemberWithData(member.id, member.guild.id, interaction.member!.user.username, reasonOption, messages)
			}

			interaction.reply({
				content: `${member} a été banni du serveur.`,
				ephemeral: true,
			});

			new Report({
				author: interaction.member as GuildMember,
				title: "Banissement",
				description: `
        **${member.user.tag}** (${member.id}) a été banni du serveur.

        **Raison:** ${reasonOption}
        **Temps:** ${timeOption ? timeOption : "Permanent"}
        **Conversation sauvegardée:** ${channelOption ? "Oui" : "Non"}
        `,
				color: (<GuildMember>interaction.member).roles.highest.color,
				thumbnail: member.user.displayAvatarURL(),
			}).sendToChannel(interaction.channel as TextChannel);
		} catch (err: any) {
			console.log(err)
			interaction.reply({
				content: `Je ne peux pas bannir ce membre ${
					err.message.startsWith("PermissionsIssue") ? "(Permissions)." : ""
				}`,
				ephemeral: true,
			});
		}
	},

	settings: {
		enabled: false,
	},
};

export default command;
