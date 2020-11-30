export class LancerCombat extends Combat {
  /* @override */
  _prepareCombatant(c, scene, players, settings={}) {
    c = super._prepareCombatant(c, scene, players, settings);

    c.activations = c.activations ?? {};
    c.activations.max = c.activations.max ?? c.actor?.data.data?.activations ?? 1;
    c.activations.value = c.activations.value ?? 0;

    c.disposition = c.token?.disposition ?? null;

    c.dummy = c.dummy ?? c.flags?.dummy ?? false;
    //c.visible = c.dummy ? 0 : c.visible;

    return c;
  }

  /* @override */
  _sortCombatants(a, b) {
    if ( a.dummy ) return -1;
    if ( b.dummy ) return 1;
    // Move inactive to the bottom
    if ( game.settings.get("lancer-initiative", "act-sort-last") ) {
      const act_a = a.activations.value === 0;
      const act_b = b.activations.value === 0;
      const act_c = act_a - act_b;
      if ( act_c !==0 ) return act_c;
    }
    // Sort by Players then Neutrals then Hostiles
    const dc = b.disposition - a.disposition;
    if ( dc !== 0 ) return dc;
    return super._sortCombatants(a, b);
  }

  /* @override */
  _onCreate(...args) {
    console.log(args);
    if (this.owner) this.createCombatant({
      "flags.dummy": true,
    });
    super._onCreate(args);
  }

  /* @public */
  async resetActivations() {
    let updates = this.combatants.map(c => { return {
      _id: c._id,
      'activations.value': c.defeated ? 0 : c.activations.max
    }});
    await this.updateCombatant(updates);
  }

  /* @override */
  async startCombat() {
    await this.resetActivations();
    return super.startCombat();
  }

  /* @override */
  async nextRound() {
    await this.resetActivations();
    return super.nextRound();
  }

  /* @override */
  async previousRound() {
    await this.resetActivations();
    let turn = 0;
    const round = Math.max(this.round - 1, 0);
    let advanceTime = -1 * this.data.turn * CONFIG.time.turnTime;
    if ( round > 0 ) advanceTime -= CONFIG.time.roundTime;
    return this.update({round, turn}, {advanceTime});
  }

  /* @override */
  async resetAll() {
    await this.resetActivations();
    return super.resetAll();
  }
}
