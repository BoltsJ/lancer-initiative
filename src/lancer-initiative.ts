import { LancerCombat, LancerCombatant } from "./module/lancer-combat.js";
import { LancerCombatTracker } from "./module/lancer-combat-tracker.js";
import { LIForm } from "./module/li-form.js";

type Appearance = typeof LancerCombatTracker["appearance"];
const module = "lancer-initiative";

function migrateSettings(): void {
  if (<number>game.settings.get(module, "combat-tracker-migrated-settings") >= 1) return;

  console.log("lancer-initiative | Migrating Settings");

  game.settings.set(
    module,
    "combat-tracker-appearance",
    <Appearance>game.settings.get(module, "appearance")
  );
  game.settings.set(module, "combat-tracker-sort", <boolean>game.settings.get(module, "sort"));
  game.settings.set(
    module,
    "combat-tracker-enable-initiative",
    <boolean>game.settings.get(module, "enable-initiative")
  );
  game.settings.set(module, "combat-tracker-migrated-settings", 1);
}

function registerSettings(): void {
  console.log("lancer-initiative | Initializing Lancer Initiative Module");
  const config = LancerCombatTracker.config;
  config.module = module;

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
    type: LIForm,
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
    default: false,
  });
  game.settings.register(module, "combat-tracker-enable-initiative", {
    name: game.i18n.localize("LANCERINITIATIVE.EnableInitiative"),
    hint: game.i18n.localize("LANCERINITIATIVE.EnableInitiativeDesc"),
    scope: "world",
    config: !!CONFIG.Combat.initiative.formula,
    type: Boolean,
    default: false,
  });
  game.settings.register(module, "combat-tracker-migrated-settings", {
    scope: "world",
    config: false,
    type: Number,
    default: 0,
  });

  // Old settings to be migrated
  game.settings.register(module, "appearance", {
    scope: "world",
    config: false,
    type: Object,
  });
  game.settings.register(module, "sort", {
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });
  game.settings.register(module, "enable-initiative", {
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });

  // Override classes
  CONFIG.Combat.documentClass = LancerCombat;
  CONFIG.Combatant.documentClass = LancerCombatant;
  CONFIG.ui.combat = LancerCombatTracker;

  // Call hooks for initialization of Lancer Initiative
  Hooks.callAll("LancerIntitaitveInit");

  // Set the css vars
  setAppearance(LancerCombatTracker.appearance);
}

function setAppearance(val: Partial<Appearance>): void {
  const defaults = LancerCombatTracker.config.def_appearance;
  document.documentElement.style.setProperty(
    "--lancer-initiative-icon-size",
    `${val?.icon_size ?? defaults.icon_size}rem`
  );
  document.documentElement.style.setProperty(
    "--lancer-initiative-player-color",
    val?.player_color ?? defaults.player_color
  );
  document.documentElement.style.setProperty(
    "--lancer-initiative-neutral-color",
    val?.neutral_color ?? defaults.neutral_color
  );
  document.documentElement.style.setProperty(
    "--lancer-initiative-enemy-color",
    val?.enemy_color ?? defaults.enemy_color
  );
  document.documentElement.style.setProperty(
    "--lancer-initiative-done-color",
    val?.done_color ?? defaults.done_color
  );
  game.combats?.render();
}

Hooks.once("init", registerSettings);
Hooks.once("ready", migrateSettings);
