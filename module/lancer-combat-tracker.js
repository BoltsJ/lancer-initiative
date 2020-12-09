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
    turns = turns.sort(function(a, b) {
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
    m.push(...super._getEntryContextOptions().filter(i => i.name !== "COMBAT.CombatantReroll"))
    return m;
  }
}
/*
 *
// Move inactive to the bottom
  if ( game.settings.get("lancer-initiative", "act-sort-last") ) {
    const act_a = a.activations.value === 0;
    const act_b = b.activations.value === 0;
    const act_c = act_a - act_b;
    if ( act_c !==0 ) return act_c;
  }
 */
