import { LancerCombat } from './module/lancer-combat.js';
import { LancerCombatTracker } from './module/lancer-combat-tracker.js';

function registerSettings() {
  console.log("lancer-initiative | Initializing Lancer Initiative Module");

  game.settings.register("lancer-initiative", "pc-col", {
    name: "Player button color",
    hint: "Default: $44abe0",
    scope: "world",
    config: true,
    type: String,
    default: "#44abe0"
  });
  game.settings.register("lancer-initiative", "nu-col", {
    name: "Neutral button color",
    hint: "Default: #146464",
    scope: "world",
    config: true,
    type: String,
    default: "#146464"
  });
  game.settings.register("lancer-initiative", "en-col", {
    name: "Enemy button color",
    hint: "Default: #d98f30",
    scope: "world",
    config: true,
    type: String,
    default: "#d98f30"
  });
  game.settings.register("lancer-initiative", "xx-col", {
    name: "Inactive button color",
    hint: "Default: #444444",
    scope: "world",
    config: true,
    type: String,
    default: "#444444"
  });
  game.settings.register("lancer-initiative", "icon", {
    name: "Action Icon",
    hint: "CSS classes to define the activation icon; li-icon, li-icon-large, and li-icon-xlarge are defined to increase the size if needed",
    scope: "world",
    config: true,
    type: String,
    default: "cci cci-activate li-icon-large"
  });
  game.settings.register("lancer-initiative", "act-sort-last", {
    name: "Activated units last",
    hint: "Moves units that have activated to the end of the tracker.  WARNING: Enabling this can prevent some modules from detecting turn changes",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  // Override classes
  CONFIG.Combat.entityClass = LancerCombat;
  CONFIG.ui.combat = LancerCombatTracker;
}

Hooks.once("init", registerSettings);

Hooks.on("renderCombatTracker", async (app, html, data) => {
    html.find(".combatant").each((i, element) => {
        const c_id = element.dataset.combatantId;
        const combatant = data.combat.getCombatant(c_id);

        if ( combatant.flags?.dummy === true) return;

        const init_div = element.getElementsByClassName("token-initiative")[0];

        // Retrieve settings
        let color = "";
        let done_color = game.settings.get("lancer-initiative", "xx-col");
        switch (combatant.token?.disposition) {
            case 1: // Player
                color = game.settings.get("lancer-initiative", "pc-col");
                break;
            case 0: // Neutral
                color = game.settings.get("lancer-initiative", "nu-col");
                break;
            case -1: // Hostile
                color = game.settings.get("lancer-initiative", "en-col");
                break;
            default:
        }
        let icon = game.settings.get("lancer-initiative", "icon");

        //get activations
        let pending = combatant.flags.activations?.value;
        if ( pending === undefined ) pending = 0;
        let finished = combatant.flags.activations?.max - pending;

        init_div.innerHTML = `<a class='${icon}' title='Activate' style='color: ${color};'></a>`.repeat(pending);
        init_div.innerHTML += `<a class='${icon}' title='Activate' style='color: ${done_color};'></a>`.repeat(finished);

        element.style.borderColor = color;

        // Create click action
        init_div.addEventListener("click", async e => {
          await data.combat.activateCombatant(c_id);
        });
    });
});
