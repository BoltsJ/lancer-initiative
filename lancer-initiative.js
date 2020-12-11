import { LancerCombat } from "./module/lancer-combat.js";
import { LancerCombatTracker } from "./module/lancer-combat-tracker.js";

function registerSettings() {
  console.log("lancer-initiative | Initializing Lancer Initiative Module");

  game.settings.register("lancer-initiative", "pc-col", {
    name: "Player button color",
    hint: "Default: $44abe0",
    scope: "world",
    config: true,
    type: String,
    default: "#44abe0",
  });
  game.settings.register("lancer-initiative", "nu-col", {
    name: "Neutral button color",
    hint: "Default: #146464",
    scope: "world",
    config: true,
    type: String,
    default: "#146464",
  });
  game.settings.register("lancer-initiative", "en-col", {
    name: "Enemy button color",
    hint: "Default: #d98f30",
    scope: "world",
    config: true,
    type: String,
    default: "#d98f30",
  });
  game.settings.register("lancer-initiative", "xx-col", {
    name: "Inactive button color",
    hint: "Default: #444444",
    scope: "world",
    config: true,
    type: String,
    default: "#444444",
  });
  game.settings.register("lancer-initiative", "icon", {
    name: "Action Icon",
    hint:
      "CSS classes to define the activation icon; li-icon, li-icon-large, and li-icon-xlarge are defined to increase the size if needed",
    scope: "world",
    config: true,
    type: String,
    default: "cci cci-activate li-icon-large",
  });
  game.settings.register("lancer-initiative", "act-sort-last", {
    name: "Activated units last",
    hint: "Moves units that have taken their turn to the end of the tracker.",
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
