import { LancerCombat } from "./module/lancer-combat.js";
import { LancerCombatTracker } from "./module/lancer-combat-tracker.js";

function registerSettings() {
  console.log("lancer-initiative | Initializing Lancer Initiative Module");

  game.settings.register("lancer-initiative", "pc-col", {
    name: game.i18n.localize("LANCERINITIATIVE.PCColor"),
    hint: "Default: $44abe0",
    scope: "world",
    config: true,
    type: String,
    default: "#44abe0",
  });
  game.settings.register("lancer-initiative", "nu-col", {
    name: game.i18n.localize("LANCERINITIATIVE.NeutralColor"),
    hint: "Default: #146464",
    scope: "world",
    config: true,
    type: String,
    default: "#146464",
  });
  game.settings.register("lancer-initiative", "en-col", {
    name: game.i18n.localize("LANCERINITIATIVE.EnemyColor"),
    hint: "Default: #d98f30",
    scope: "world",
    config: true,
    type: String,
    default: "#d98f30",
  });
  game.settings.register("lancer-initiative", "xx-col", {
    name: game.i18n.localize("LANCERINITIATIVE.DoneColor"),
    hint: "Default: #444444",
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
    name: game.i18n.localize("LANCERINITIATIVE.Icon"),
    hint: game.i18n.localize("LANCERINITIATIVE.IconDesc"),
    scope: "world",
    config: true,
    type: String,
    default: def_icon,
  });
  game.settings.register("lancer-initiative", "act-sort-last", {
    name: game.i18n.localize("LANCERINITIATIVE.ActivatedLast"),
    hint: game.i18n.localize("LANCERINITIATIVE.ActivatedLastDesc"),
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
