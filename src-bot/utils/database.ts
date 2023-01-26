import { PrismaClient, Member, Ban } from "../../node_modules/.prisma/client";

const prisma = new PrismaClient();

export class Database {
	public static async init() {
		await prisma.$connect().then(() => console.log("Connected to database"));
	}

	public static async getOrCreateGuild(id: string) {
		let data = await prisma.guild.findFirst({
			where: { id },
		});

		if (!data) {
			data = await prisma.guild.create({
				data: { id },
			});
		}

		return data;
	}

	public static async getMembersOfGuild(id: string) {
		const members = await prisma.member.findMany({
			where: { guildId: id },
		});

		return members;
	}

	public static async getBannedMembers(): Promise<Ban[]> {
		const bannedMembers = await prisma.ban.findMany({
			where: { banned: true },
		});

		return bannedMembers;
	}

	public static async getOrCreateMember(
		id: string,
		guildId: string
	): Promise<Member> {
		let guild = await this.getOrCreateGuild(guildId);

		let data = await prisma.member.findFirst({
			where: { id, guild },
		});

		if (!data) {
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
		let memberData = await this.getOrCreateMember(id, guildId);
		let memberBan = await prisma.ban.findFirst({
			where: { memberId: memberData.id, guildId },
		});

		return memberBan;
	}

	public static async unbanMember(id: string, guildId: string) {
		let memberBan = await this.getBanStateOfMember(id, guildId);

		if (memberBan) {
			await prisma.ban.delete({
				where: {
					modelId: memberBan.modelId,
				},
			});
		}
	}

	public static async tempBanMember(id: string, guildId: string, time: number) {
		let member = await this.getOrCreateMember(id, guildId);

		await prisma.ban.create({
			data: {
				memberId: member.id,
				guildId,
				banned: true,
				until: Date.now() + time,
			},
		});
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
}
