import {
  LancerCombat,
  LancerCombatTracker,
  LancerCombatant,
  addMissingDummy,
  getTrackerAppearance,
  setAppearance,
} from "lancer-initiative";
import { LancerInitiativeConfigForm } from "./li-form";

const module = "lancer-initiative";
const templatePath = "modules/lancer-initiative/templates/lancer-combat-tracker.html";

function registerSettings(): void {
  console.log(`${module} | Initializing Lancer Initiative Module`);
  if (!!CONFIG.LancerInitiative?.module) {
    throw new Error(
      `${module} | Lancer Intitiative already initiatilized, does your system implement it?`
    );
  }
  const config = (CONFIG.LancerInitiative = {
    module,
    templatePath,
    def_appearance: {
      icon: "fas fa-chevron-circle-right",
      icon_size: 1.5,
      player_color: "#44abe0",
      friendly_color: "#44abe0",
      neutral_color: "#146464",
      enemy_color: "#d98f30",
      done_color: "#444444",
    },
    activation_path: "derived.mm.Activations",
  });
  Object.defineProperty(CONFIG.LancerInitiative, "module", { writable: false });

  switch (game.system.id) {
    case "lancer":
      config.def_appearance.icon = "cci cci-activate";
      config.def_appearance.icon_size = 2;
      break;
    default:
  }

  game.settings.registerMenu(module, "lancerInitiative", {
    name: game.i18n.localize("LANCERINITIATIVE.IconSettingsMenu"),
    label: game.i18n.localize("LANCERINITIATIVE.IconSettingsMenu"),
    type: LancerInitiativeConfigForm,
    restricted: true,
  });
  game.settings.register(module, "combat-tracker-appearance", {
    scope: "world",
    config: false,
    type: Object,
    onChange: setAppearance,
  });
  game.settings.register(module, "combat-tracker-sort", {
    name: game.i18n.localize("LANCERINITIATIVE.SortTracker"),
    hint: game.i18n.localize("LANCERINITIATIVE.SortTrackerDesc"),
    scope: "world",
    config: true,
    type: Boolean,
    onChange: () => game.combats?.render(),
    default: false,
  });
  game.settings.register(module, "combat-tracker-enable-initiative", {
    name: game.i18n.localize("LANCERINITIATIVE.EnableInitiative"),
    hint: game.i18n.localize("LANCERINITIATIVE.EnableInitiativeDesc"),
    scope: "world",
    config: !!CONFIG.Combat.initiative.formula,
    type: Boolean,
    onChange: () => game.combats?.render(),
    default: false,
  });

  // Override classes
  CONFIG.Combat.documentClass = LancerCombat;
  CONFIG.Combatant.documentClass = LancerCombatant;
  CONFIG.ui.combat = LancerCombatTracker;

  // Call hooks to signal other modules of the initialization
  Hooks.callAll("LancerIntitaitveInit");

  // Set the css vars
  setAppearance(getTrackerAppearance());
}

Hooks.once("init", registerSettings);
Hooks.once("ready", addMissingDummy);
