import { ChatInputCommandInteraction, Guild, GuildFeature, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../models/slash-commands";
import { Database } from "../../utils/database";

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("raidmode")
    .setDescription("Montre l'état du raidmode")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) => {
      return option
        .setName("state")
        .setDescription("Active ou désactive le mode raid")
        .addChoices(
          { name: "on", value: "on" },
          { name: "off", value: "off" }
        )
        .setRequired(false);
    }),

    async exec(interaction: ChatInputCommandInteraction) {
      const stateOption = interaction.options.getString("state");
      const guildData = await Database.getOrCreateGuild(interaction.guildId!);

      if(stateOption) {
        switch(stateOption) {
          case "on":
            await Database.setRaidmodeState(true, interaction.guildId!);
            break;
          case "off":
            await Database.setRaidmodeState(false, interaction.guildId!);
            break;
        }

        interaction.reply({ content: `Raidmode ${stateOption == "on" ? "activé" : "désactivé"} !`, ephemeral: true });
      } else {

        let state = guildData.raidmode;
        interaction.reply({ content: `Le mode raid est **${state ? "activé" : "désactivé"} !**`, ephemeral: true });
      }

      let perm = interaction.guild!.members.me?.permissions.has(PermissionFlagsBits.KickMembers);
      if(!perm) {
        interaction.channel?.send({ content: ":warning: Je n'ai pas la permission 'Expulser des membres', je ne pourrais donc pas réagir en cas de raid." });
      }
    },

    settings: {
      enabled: true
    }
}

export default command;