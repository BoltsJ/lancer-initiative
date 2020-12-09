import {libWrapper} from './module/shim.js';

async function setup() {
  libWrapper.register('lancer-initiative', 'Combat.prototype._sortCombatants', function (w, a, b) {
    let r = sortCombatants(a, b);
    if (r === 0) r = w.apply(this, [a, b]);
    return r;
  });

  libWrapper.register('lancer-initiative', 'CombatTracker.prototype._getEntryContextOptions', function(w) {
    let m = [
      {
        name: "Add Activation",
        icon: '<i class="fas fa-plus"></i>',
        callback:  async (li) => {
          const combatant = this.combat.getCombatant(li.data('combatant-id'));
          let max = combatant.flags.activations.max + 1;
          await this.combat.updateCombatant({
            _id: combatant._id,
            "flags.activations.max": max
          });
        }
      },
      {
        name: "Remove Activation",
        icon: '<i class="fas fa-minus"></i>',
        callback:  async (li) => {
          const combatant = this.combat.getCombatant(li.data('combatant-id'));
          let max = combatant.flags.activations.max - 1;
          let cur = clampNumber(combatant.flags.activations.value, 0, max > 0 ? max : 1);
          await this.combat.updateCombatant({
            _id: combatant._id,
            "flags.activations.max": max > 0 ? max : 1,
            "flags.activations.value": cur
          });
        }
      },
      {
        name: "Undo Activation",
        icon: '<i class="fas fa-undo"></i>',
        callback: li => {
          const combatant = this.combat.getCombatant(li.data('combatant-id'));
          let max = combatant.flags.activations.max;
          let cur = clampNumber(combatant.flags.activations.value+1, 0, max > 0 ? max : 1);
          this.combat.updateCombatant({
            _id: combatant._id,
            "flags.activations.value": cur
          });
        }
      }
    ];
    m.push(...w.call().filter(i => i.name !== "COMBAT.CombatantReroll"))
    return m;
  });

}

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
}

function sortCombatants(a, b) {
  //DUMMYs first ;)
  if ( a.flags?.dummy === true ) return -1;
  if ( b.flags?.dummy === true ) return 1;
  // Move inactive to the bottom
  if ( game.settings.get("lancer-initiative", "act-sort-last") ) {
    const act_a = a.flags.activations?.value === 0;
    const act_b = b.flags.activations?.value === 0;
    const act_c = act_a - act_b;
    if ( act_c !==0 ) return act_c;
  }
  // Sort by Players then Neutrals then Hostiles
  const dc = b.token.disposition - a.token.disposition;
  if ( dc !== 0 ) return dc;
  return 0; //fallback to foundry
}

function handleCreateCombat(combat, options, userId) {
  if (game.user.isGM) combat.createCombatant({
    name: "DUMMY",
    flags: { dummy: true },
    hidden: true
  });
}

function handleUpdateCombat(combat, changed, options, userId) {
  if (! game.user.isGM ) return;
  if ("round" in changed) {
    combat.combatants.map(c =>
      combat.updateCombatant({
        _id: c._id,
        "flags.activations.value": c.defeated ? 0 : c.flags.activations?.max
      })
    );
  }
}

function handleCreateCombatant(combat, combatant, options, userId) {
  if (! game.user.isGM ) return;
  if (combatant.tokenId === undefined) return;
  // AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
  let a = canvas.tokens.get(combatant.tokenId).actor.data.data?.activations;
  combat.updateCombatant({
    _id: combatant._id,
    flags: {
      activations: {
        value: 0,
        max: a === undefined ? 1 : a
      }
    }
  });
}

Hooks.once("init", () => {
  setup();
  registerSettings();
});

Hooks.once("ready", () => { // Detect and recover from Foundry deciding that it doesn't want to save data.
  if (! game.user.isGM ) return;
  game.combats.map(c => {
    c.combatants.map(t => {
      if ((t.flags.activations?.value === undefined || t.flags.activations?.max === undefined) && t.flags?.dummy !== true) {
        let a = t.actor.data.data?.activations;
        c.updateCombatant({
          _id: t._id,
          flags: {
            activations: {
              value: 0,
              max: a === undefined ? 1 : a
            }
          }
        });
      }
    });
  });
});

Hooks.on("createCombat", handleCreateCombat);
Hooks.on("updateCombat", handleUpdateCombat);
Hooks.on("createCombatant", handleCreateCombatant);

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
            let val = combatant.flags.activations.value
            if (val === 0) return;
            await data.combat.updateCombatant({ // Sync here in case tracker order changes
                _id: combatant._id,
                "flags.activations.value": val-1
            });
            const turn = data.combat.turns.findIndex(t => t._id === c_id);
            await data.combat.update({ turn: turn });
        });
    });
});
