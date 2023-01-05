import { EmbedBuilder, GuildMember, TextChannel } from "discord.js";

export class Report {
	public author: GuildMember;
	public title?: string;
	public description: string;
	public color: number;
	public thumbnail?: string;

	constructor(options: reportOptions) {
		this.author = options.author;
		this.title = options.title;
		this.description = options.description;
		this.color = options.color;
		this.thumbnail = options.thumbnail;
	}

	public sendToChannel(channel: TextChannel) {
		const embed = new EmbedBuilder()
			.setAuthor({
				iconURL: this.author.displayAvatarURL(),
				name: this.author.user.tag,
			})
			.setColor(this.color)
			.setDescription(this.description)
			.setTimestamp();
		if (this.title) embed.setTitle(this.title);
		if (this.thumbnail) embed.setThumbnail(this.thumbnail);

		channel.send({ embeds: [embed] });
	}
}

interface reportOptions {
	author: GuildMember;
	title?: string;
	description: string;
	color: number;
	thumbnail?: string;
}
