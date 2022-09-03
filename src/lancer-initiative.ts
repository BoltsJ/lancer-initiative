import {
  LancerCombat,
  LancerCombatTracker,
  LancerCombatant,
  getTrackerAppearance,
  setAppearance,
} from "lancer-initiative";
import { LancerInitiativeConfigForm } from "./li-form";

const module = "lancer-initiative";
const templatePath = "modules/lancer-initiative/templates/lancer-combat-tracker.html";

function registerSettings(): void {
  console.log(`${module} | Initializing Lancer Initiative Module`);
  if (!!CONFIG.LancerInitiative?.module) {
    Hooks.once("ready", () =>
      ui.notifications!.warn(
        "The system you are using implements lancer initiative natively. You can disable the module",
        { permanent: true }
      )
    );
    throw new Error(
      `${module} | Lancer Intitiative already initiatilized, does your system implement it?`
    );
  }
  CONFIG.LancerInitiative = {
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
  };
  Object.defineProperty(CONFIG.LancerInitiative, "module", { writable: false });

  // const old_combat = CONFIG.Combat.documentClass;

  // Override classes
  CONFIG.Combat.documentClass = LancerCombat;
  CONFIG.Combatant.documentClass = LancerCombatant;
  CONFIG.ui.combat = LancerCombatTracker;

  switch (game.system.id) {
    case "starwarsffg":
      // import("./starwarsffg").then(m => m.setup(old_combat));
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
    default: {},
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
  // Allows initiative rolling to be toggled. Optional for downstreams.
  game.settings.register(module, "combat-tracker-enable-initiative", {
    name: game.i18n.localize("LANCERINITIATIVE.EnableInitiative"),
    hint: game.i18n.localize("LANCERINITIATIVE.EnableInitiativeDesc"),
    scope: "world",
    config: !!CONFIG.Combat.initiative.formula,
    type: Boolean,
    onChange: v => {
      CONFIG.LancerInitiative.enable_initiative = v;
      game.combats?.render();
    },
    default: false,
  });
  CONFIG.LancerInitiative.enable_initiative = game.settings.get(
    module,
    "combat-tracker-enable-initiative"
  );

  // Call hooks to signal other modules of the initialization
  Hooks.callAll("LancerInitiativeInit");

  // Set the css vars
  setAppearance(getTrackerAppearance());
}

Hooks.once("init", registerSettings);
