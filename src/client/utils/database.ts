import {
	PrismaClient,
	type Member,
	type Ban,
} from "../../../node_modules/.prisma/client";

const prisma = new PrismaClient();

export class Database {
	public static async init() {
		await prisma.$connect().then(() => {
			console.log("Connected to database");
		});
	}

	public static async getOrCreateGuild(id: string) {
		let data = await prisma.guild.findFirst({
			where: { id },
		});

		if (data == null) {
			data = await prisma.guild.create({
				data: { id },
			});
		}

		return data;
	}

	public static async createTicketConfig(
		guildId: string,
		modRoleId: string,
		ticketCategoryId: string
	) {
		const guild = await this.getOrCreateGuild(guildId);

		const existing = await prisma.ticketsConfig.findFirst({
			where: { guildId: guild.id },
		});

		if (existing == null) {
			await prisma.ticketsConfig.create({
				data: {
					modRoleId,
					ticketCategoryId,
					guildId,
				},
			});
		} else {
			await prisma.ticketsConfig.update({
				where: {
					modelId: existing.modelId,
				},
				data: {
					modRoleId,
					ticketCategoryId,
				},
			});
		}
	}

	public static async getMembersOfGuild(id: string) {
		const members = await prisma.member.findMany({
			where: { guildId: id },
		});

		return members;
	}

	public static async getBannedMembers(): Promise<Ban[]> {
		const bannedMembers = await prisma.ban.findMany({});

		return bannedMembers;
	}

	public static async getOrCreateMember(
		id: string,
		guildId: string
	): Promise<Member> {
		const guild = await this.getOrCreateGuild(guildId);

		let data = await prisma.member.findFirst({
			where: { id, guild },
		});

		if (data == null) {
			data = await prisma.member.create({
				data: {
					id,
					guildId: guild.id,
				},
			});
		}

		return data;
	}

	public static async getBanStateOfMember(id: string, guildId: string) {
		const memberData = await this.getOrCreateMember(id, guildId);
		const memberBan = await prisma.ban.findFirst({
			where: {
				memberId: memberData.id,
				member: {
					guildId,
				},
			},
		});

		return memberBan;
	}

	public static async unbanMember(id: string, guildId: string) {
		const memberBan = await this.getBanStateOfMember(id, guildId);

		if (memberBan != null) {
			await prisma.ban.delete({
				where: {
					modelId: memberBan.modelId,
				},
			});
		}
	}

	public static async tempBanMember(
		id: string,
		guildId: string,
		time: number,
		moderator: string,
		reason: string
	) {
		const member = await this.getOrCreateMember(id, guildId);

		await prisma.ban.create({
			data: {
				guildId,
				memberId: member.id,
				until: Date.now() + time,
				moderator,
				reason,
			},
		});
	}

	public static async banMemberWithData(
		id: string,
		guildId: string,
		moderator: string,
		reason: string,
		data: string[]
	) {
		const member = await this.getOrCreateMember(id, guildId);

		const alreadyBanned = await prisma.ban.findFirst({
			where: {
				memberId: id,
				member: {
					guildId,
				},
			},
		});

		if (alreadyBanned != null) {
			await prisma.ban.update({
				where: {
					modelId: alreadyBanned.modelId,
				},
				data: {
					data,
				},
			});
		} else {
			await prisma.ban.create({
				data: {
					guildId,
					memberId: member.id,
					moderator,
					reason,
					data,
				},
			});
		}
	}

	public static async setRaidmodeState(state: boolean, guildId: string) {
		await prisma.guild.update({
			where: {
				id: guildId,
			},
			data: {
				raidmode: state,
			},
		});
	}

	public static async addNoteToMember(
		id: string,
		guildId: string,
		note: string
	) {
		const member = await this.getOrCreateMember(id, guildId);

		await prisma.member.update({
			where: {
				modelId: member.modelId,
			},
			data: {
				internalNote: member.internalNote
					? member.internalNote + "\n" + note
					: note,
			},
		});
	}

	public static async removeNotesFromMember(id: string, guildId: string) {
		const member = await this.getOrCreateMember(id, guildId);

		await prisma.member.update({
			where: {
				modelId: member.modelId,
			},
			data: {
				internalNote: "",
			},
		});
	}

	public static async getNotesOfMember(id: string, guildId: string) {
		const member = await this.getOrCreateMember(id, guildId);

		return member.internalNote;
	}

	public static async getTicketCategory(guildId: string) {
		const res = await prisma.ticketsConfig.findFirst({
			where: {
				guildId,
			},
			select: {
				ticketCategoryId: true,
			},
		});

		return res?.ticketCategoryId;
	}

	public static async getTicketModRoleId(guildId: string) {
		const res = await prisma.ticketsConfig.findFirst({
			where: {
				guildId,
			},
			select: { modRoleId: true },
		});

		return res!.modRoleId;
	}

	public static async createTicket(
		guildId: string,
		channelId: string,
		ownerId: string
	) {
		let config = await prisma.ticketsConfig.findFirst({
			where: {
				guildId,
			},
		});
		await prisma.ticket.create({
			data: {
				channelId,
				ownerId,
				ticketsConfigId: config?.modelId,
				guildId,
			},
		});
	}

	public static async increaseTicketCount(guildId: string) {
		const guild = await this.getOrCreateGuild(guildId);

		const config = await prisma.ticketsConfig.update({
			where: {
				guildId: guild.id,
			},
			data: {
				count: {
					increment: 1,
				},
			},
		});

		return formatTicketNumber(config.count + 1);
	}

	public static async removeTicket(guildId: string, channelId: string) {
		await prisma.ticket.delete({
			where: {
				channelId,
			},
		});
	}

	public static async isAlreadyInTicket(guildId: string, userId: string) {
		const existing = await prisma.ticket.findFirst({
			where: {
				ownerId: userId,
				guildId,
			},
		});

		return existing != null;
	}

	public static async isTicket(guildId: string, channelId: string) {
		const isticket = await prisma.ticket.findFirst({
			where: {
				channelId,
				guildId,
			},
		});

		return isticket;
	}

	public static async updateVerifiedRole(guildId: string, roleId: string) {
		const guild = await this.getOrCreateGuild(guildId);

		await prisma.guild.update({
			where: {
				modelId: guild.modelId,
			},
			data: {
				verifiedRoleId: roleId,
			},
		});
	}

	public static async getVerifiedRole(guildId: string) {
		const req = await prisma.guild.findFirst({
			where: {
				id: guildId,
			},
			select: {
				verifiedRoleId: true,
			},
		});

		return req?.verifiedRoleId;
	}
}

function formatTicketNumber(number: number) {
	let out = number.toString();
	while (out.length < 4) {
		out = "0" + out;
	}

	return out;
}
