export class LancerCombatTracker extends CombatTracker {
  /**
   * @override
   * Intercepts the data being sent to the combat tracker window and
   * optionally sorts the the turn data that gets displayed. This allows the
   * units that have already gone to be moved to the bottom without the risk of
   * updateCombat events being eaten.
   */
  async getData(options) {
    let data = await super.getData(options);
    const sort = game.settings.get("lancer-initiative", "act-sort-last");
    if (!data.hasCombat || !sort) return data;
    let turns = Array.from(data.turns);
    turns = turns.sort(function (a, b) {
      const ad = a.flags.activations.value === 0 && a.css.indexOf("active") === -1;
      const bd = b.flags.activations.value === 0 && b.css.indexOf("active") === -1;
      return ad - bd;
    });
    return mergeObject(data, {
      turns: turns,
    });
  }

  /**
   * @override
   */
  _getEntryContextOptions() {
    let m = [
      {
        name: "Add Activation",
        icon: '<i class="fas fa-plus"></i>',
        callback: async li => {
          const combatant = this.combat.getCombatant(li.data("combatant-id"));
          let max = combatant.flags.activations.max + 1;
          await this.combat.updateCombatant({
            _id: combatant._id,
            "flags.activations.max": max,
          });
        },
      },
      {
        name: "Remove Activation",
        icon: '<i class="fas fa-minus"></i>',
        callback: async li => {
          const combatant = this.combat.getCombatant(li.data("combatant-id"));
          let max = combatant.flags.activations.max - 1;
          let cur = clampNumber(combatant.flags.activations.value, 0, max > 0 ? max : 1);
          await this.combat.updateCombatant({
            _id: combatant._id,
            "flags.activations.max": max > 0 ? max : 1,
            "flags.activations.value": cur,
          });
        },
      },
      {
        name: "Undo Activation",
        icon: '<i class="fas fa-undo"></i>',
        callback: li => {
          const combatant = this.combat.getCombatant(li.data("combatant-id"));
          let max = combatant.flags.activations.max;
          let cur = clampNumber(combatant.flags.activations.value + 1, 0, max > 0 ? max : 1);
          this.combat.updateCombatant({
            _id: combatant._id,
            "flags.activations.value": cur,
          });
        },
      },
    ];
    m.push(...super._getEntryContextOptions().filter(i => i.name !== "COMBAT.CombatantReroll"));
    return m;
  }

  /**
   * Helper function to modify the combat tracker. Must be hooked to the
   * renderCombatTracker event
   */
  static handleRender(app, html, data) {
    html.find(".combatant").each((i, element) => {
      const c_id = element.dataset.combatantId;
      const combatant = data.combat.getCombatant(c_id);

      if (combatant.flags?.dummy === true) return;

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
      if (pending === undefined) pending = 0;
      let finished = combatant.flags.activations?.max - pending;

      init_div.innerHTML = `<a class='${icon}' title='Activate' style='color: ${color};'></a>`.repeat(
        pending
      );
      init_div.innerHTML += `<a class='${icon}' title='Activate' style='color: ${done_color};'></a>`.repeat(
        finished
      );

      element.style.borderColor = color;

      // Create click action
      init_div.addEventListener("click", async e => {
        await data.combat.activateCombatant(c_id);
      });
    });
  }
}
