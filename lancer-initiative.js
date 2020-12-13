import { LancerCombat } from "./module/lancer-combat.js";
import { LancerCombatTracker } from "./module/lancer-combat-tracker.js";

function registerSettings() {
  console.log("lancer-initiative | Initializing Lancer Initiative Module");

  game.settings.register("lancer-initiative", "pc-col", {
    name: "LancerInitiative.Settings.PlayerButtonColor",
    hint: "LancerInitiative.Settings.PlayerButtonColorHint",
    scope: "world",
    config: true,
    type: String,
    default: "#44abe0",
  });
  game.settings.register("lancer-initiative", "nu-col", {
    name: "LancerInitiative.Settings.NeutralButtonColor",
    hint: "LancerInitiative.Settings.NeutralButtonColorHint",
    scope: "world",
    config: true,
    type: String,
    default: "#146464",
  });
  game.settings.register("lancer-initiative", "en-col", {
    name: "LancerInitiative.Settings.EnemyButtonColor",
    hint: "LancerInitiative.Settings.EnemyButtonColorHint",
    scope: "world",
    config: true,
    type: String,
    default: "#d98f30",
  });
  game.settings.register("lancer-initiative", "xx-col", {
    name: "LancerInitiative.Settings.InactiveButtonColor",
    hint: "LancerInitiative.Settings.InactiveButtonColorHint",
    scope: "world",
    config: true,
    type: String,
    default: "#444444",
  });

  let def_icon = "";
  switch (game.system.id) {
    case "lancer":
      def_icon = "cci cci-activate li-icon-large";
      break;
    default:
      def_icon = "fas fa-chevron-circle-right li-icon";
  }

  game.settings.register("lancer-initiative", "icon", {
    name: "LancerInitiative.Settings.ActionIcon",
    hint: "LancerInitiative.Settings.ActionIconHint",
    scope: "world",
    config: true,
    type: String,
    default: def_icon,
  });
  game.settings.register("lancer-initiative", "act-sort-last", {
    name: "LancerInitiative.Settings.ActivatedUnitsLast",
    hint: "LancerInitiative.Settings.ActivatedUnitsLastHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  // Override classes
  CONFIG.Combat.entityClass = LancerCombat;
  CONFIG.ui.combat = LancerCombatTracker;
}

Hooks.once("init", registerSettings);
Hooks.on("renderCombatTracker", LancerCombatTracker.handleRender);
