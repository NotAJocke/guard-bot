import { Client as DSClient, REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";

import Config from "./config";
import devConfig from "../environments/environment";
import prodConfig from "../environments/environment.prod";
import { ContextMenu } from "./context-menu";
import { SlashCommand } from "./slash-commands";

export class Client extends DSClient {
	private config: Config =
		process.env.PRODUCTION == "TRUE" ? prodConfig : devConfig;
	private slashCommands: SlashCommand[] = [];
	private contextMenus: ContextMenu[] = [];

	constructor() {
		super({
			intents:
				process.env.PRODUCTION == "TRUE"
					? prodConfig.intents
					: devConfig.intents,
		});
	}

	public getConfig(): Config {
		return this.config;
	}

	public getSlashCommands(): SlashCommand[] {
		return this.slashCommands;
	}

	public getContextMenus(): ContextMenu[] {
		return this.contextMenus;
	}

	public async loadEvents() {
		let files = readdirSync(join(__dirname, "..", "events"));
		for (let file of files) {
			let event = require(join(__dirname, "..", "events", file));
			if (event.default.settings.enabled) {
				let eventName = file.split(".")[0];
				this.on(eventName, (...args) => event.default.exec(this, ...args));
				console.log(`Load Event: ${eventName}`);
			}
		}
		console.log(`${files.length} events loaded`);
	}

	public async loadSlashCommands() {
		let subfolders = readdirSync(join(__dirname, "..", "commands"));
		for (let folder of subfolders) {
			let files = readdirSync(join(__dirname, "..", "commands", folder));
			for (let file of files) {
				let command = require(join(__dirname, "..", "commands", folder, file));
				let commandName = file.split(".")[0];
				if (command.default.settings.enabled) {
					this.slashCommands.push(command.default);
					console.log(`Load Command: ${commandName}`);
				}
			}
		}
		console.log(`${this.slashCommands.length} commands loaded`);
	}

	public async loadContextMenus() {
		let files = readdirSync(join(__dirname, "..", "context-menus"));
		for (let file of files) {
			let command = require(join(__dirname, "..", "context-menus", file));
			let commandName = file.split(".")[0];
			if (command.default.settings.enabled) {
				this.contextMenus.push(command.default);
				console.log(`Load Menu: ${commandName}`);
			}
		}
		console.log(`${this.contextMenus.length} menus loaded`);
	}

	private async getSynchronizableInteractions(
		syncInteractions: SynchronizableInteractions
	): Promise<any[]> {
		let data = [];
		if (syncInteractions.contextMenus) {
			if (this.contextMenus.length === 0) {
				console.log("No context menus loaded");
			} else {
				console.log(`Synchronizing ${this.contextMenus.length} context menus`);
				data.push(...this.contextMenus.map((menu) => menu.data.toJSON()));
			}
		}
		if (syncInteractions.slashCommands) {
			if (this.slashCommands.length === 0) {
				console.log("No slash commands loaded");
			} else {
				console.log(
					`Synchronizing ${this.slashCommands.length} slash commands`
				);
				data.push(...this.slashCommands.map((cmd) => cmd.data.toJSON()));
			}
		}
		return data;
	}

	public async syncInteractionsForGuild(
		guildId: string,
		syncInteractions: SynchronizableInteractions
	) {
		let data = await this.getSynchronizableInteractions(syncInteractions);
		if (data.length <= 0) return console.log("No data to synchronise");
		let rest = new REST({ version: "10" });

		if(process.env.PRODUCTION == "TRUE") {
			rest.setToken(process.env.PROD_CLIENT_TOKEN!);
		} else {
			rest.setToken(process.env.CLIENT_TOKEN!);
		}
		try {
			rest.put(
				Routes.applicationGuildCommands(
					process.env.PRODUCTION == "TRUE" ? process.env.PROD_CLIENT_ID! : process.env.CLIENT_ID!,
					guildId
				),
				{ body: data }
			);
		} catch (e) {
			console.log(`${e}`);
		}
	}

	/* public async syncGlobalInteractions(
		syncInteractions: SynchronizableInteractions
	) {
		let data = await this.getSynchronizableInteractions(syncInteractions);
		if (data.length === 0) return console.log("No data to synchronise");
		let rest = new REST({ version: "10" }).setToken(process.env.CLIENT_TOKEN!);
		try {
			rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
				body: data,
			});
		} catch (e) {
			console.log(`${e}`, "error");
		}
	} */

	/**
	 * Unloads all slash commands and context menus from the bot.
	 * Use this function if you have duplicated interactions registered.
	 */
	public async unSyncInteractions() {
		await this.application?.commands.set([]);
		for (let guild of this.guilds.cache.values()) {
			await guild.commands.set([]);
		}
	}
}

interface SynchronizableInteractions {
	slashCommands?: boolean;
	contextMenus?: boolean;
}
