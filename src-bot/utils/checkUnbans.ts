import { Client } from "../models/client";
import { Database } from "./database";

export async function checkUnbans(client: Client) {
	setInterval(async () => {
		console.log("Checking for unbans...");
		let bans = await Database.getBannedMembers();

		bans.forEach(async (ban) => {
			if (ban.until! <= Date.now()) {
				await Database.unbanMember(ban.memberId, ban.guildId);
				const guild = await client.guilds.fetch(ban.guildId);
				const member = await guild.members.fetch(ban.memberId);
				await guild.bans.remove(member);
				console.log(`Unbanned ${ban.memberId}`);
			}
		});
	}, 1000 * 60 * 5);
}
