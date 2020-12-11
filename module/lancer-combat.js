export class LancerCombat extends Combat {
  /**
   * @param {object} c Combatant
   * @param {Scene} scene Scen containing the combat
   * @param {User[]} players
   * @param {object} settings
   * @override
   */
  _prepareCombatant(c, scene, players, settings = {}) {
    c = super._prepareCombatant(c, scene, players, settings);

    // Populate activation data
    c.flags.activations = c.flags.activations ?? {};
    c.flags.activations.max = c.flags.activations.max ?? c.actor?.data.data?.activations ?? 1;
    c.flags.activations.value = c.flags.activations.value ?? 0;

    c.flags.dummy = c.flags.dummy ?? false;

    return c;
  }

  /**
   * @param {object} a Combatant
   * @param {object} b Combatant
   * @override
   */
  _sortCombatants(a, b) {
    if (a.flags.dummy) return -1;
    if (b.flags.dummy) return 1;
    // Sort by Players then Neutrals then Hostiles
    const dc = b.token?.disposition - a.token?.disposition;
    if (dc !== 0) return dc;
    return super._sortCombatants(a, b);
  }

  /**
   * @param {object} data
   * @param {object} options
   * @param {string} userId
   * @override
   */
  _onCreate(data, options, userId) {
    if (this.owner)
      this.createCombatant({
        "flags.dummy": true,
        hidden: true,
      });
    super._onCreate(data, options, userId);
  }

  /**
   * @public
   */
  async resetActivations() {
    let updates = this.combatants.map(c => {
      return {
        _id: c._id,
        "flags.activations.value": c.defeated ? 0 : c.flags.activations.max,
        "flags.activations.max": c.flags.activations.max,
      };
    });
    await this.updateCombatant(updates);
  }

  /**
   * @override
   */
  async startCombat() {
    await this.resetActivations();
    return super.startCombat();
  }

  /**
   * @override
   */
  async nextRound() {
    await this.resetActivations();
    return super.nextRound();
  }

  /**
   * @override
   */
  async previousRound() {
    await this.resetActivations();
    let turn = 0;
    const round = Math.max(this.round - 1, 0);
    let advanceTime = -1 * this.turn * CONFIG.time.turnTime;
    if (round > 0) advanceTime -= CONFIG.time.roundTime;
    return this.update({ round, turn }, { advanceTime });
  }

  /**
   * @override
   */
  async resetAll() {
    await this.resetActivations();
    return super.resetAll();
  }

  /**
   * Sets the active turn to the combatant passed by id
   * @param {string} id
   */
  async activateCombatant(id) {
    if (!game.user.isGM) return;
    let c = this.getCombatant(id);
    let val = c.flags.activations.value;
    if (val === 0) return;
    await this.updateCombatant({
      _id: id,
      "flags.activations.value": val - 1,
    });
    const turn = this.turns.findIndex(t => t._id === id);
    return this.update({ turn });
  }
}
