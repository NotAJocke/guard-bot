import { ChatInputCommandInteraction, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../models/slash-commands";
import { Database } from "../../utils/database";

const command: SlashCommand = {

  settings: {
    enabled: false,
  },

  data: new SlashCommandBuilder()
    .setName("note")
    .setDescription("Ajoute une note privée à un membre")
    .setDMPermission(false)
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("add")
        .setDescription("Ajoute une note à un membre")
        .addUserOption((option) => {
          return option
            .setName("membre")
            .setDescription("Le membre visé")
            .setRequired(true);
        })
        .addStringOption((option) => {
          return option
            .setName("note")
            .setDescription("La note à ajouter")
            .setRequired(true);
        })
    })
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("remove")
        .setDescription("Supprime une note d'un membre")
        .addUserOption((option) => {
          return option
            .setName("membre")
            .setDescription("Le membre visé")
            .setRequired(true);
        })
    })
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("get")
        .setDescription("Affiche les notes d'un membre")
        .addUserOption((option) => {
          return option
            .setName("membre")
            .setDescription("Le membre visé")
            .setRequired(true);
        })
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async exec(interaction: ChatInputCommandInteraction) {

    const subcommand = interaction.options.getSubcommand();
    const memberOption = interaction.options.getMember("membre")!;

    if(subcommand === "add") {
      const noteOption = interaction.options.getString("note")!;

      Database.addNoteToMember((memberOption as GuildMember).id, interaction.guildId!, noteOption);

      interaction.reply({ content: "Note ajoutée avec succès", ephemeral: true });
    }
    else if (subcommand === "remove") {
      Database.removeNotesFromMember((memberOption as GuildMember).id, interaction.guildId!);
      interaction.reply({ content: "Notes supprimées avec succès", ephemeral: true })
    }
    else if (subcommand === "get") {
      let notes = await Database.getNotesOfMember((memberOption as GuildMember).id, interaction.guildId!);

      interaction.reply({ content: notes ? "```"+notes+"```" : "Aucune note", ephemeral: true });
    }
  }
}

export default command;