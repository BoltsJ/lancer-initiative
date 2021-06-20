import { LancerCombatTracker } from "./lancer-combat-tracker.js";

/**
 * Overrides and extends the Combat class to use an activation model instead of
 * the standard ordered list of turns. {@link LancerCombat#activateCombatant}
 * is added to the interface.
 */
export class LancerCombat extends Combat {
  /** @override */
  protected _sortCombatants(a: LancerCombatant, b: LancerCombatant): number {
    const module = LancerCombatTracker.config.module;
    if (<boolean | undefined>a.getFlag(module, "dummy") ?? false) return -1;
    if (<boolean | undefined>b.getFlag(module, "dummy") ?? false) return 1;
    // Sort by Players then Neutrals then Hostiles
    const dc = (b.token?.data.disposition ?? -2) - (a.token?.data.disposition ?? -2);
    if (dc !== 0) return dc;
    return super._sortCombatants(a, b);
  }

  /** @override */
  protected async _preCreate(
    data: ClientDocument["data"],
    options: unknown,
    user: User
  ): Promise<void> {
    const module = LancerCombatTracker.config.module;
    const dummy = new CONFIG.Combatant.documentClass({
      flags: {
        [module]: {
          dummy: true,
          activations: {},
        },
      },
      hidden: true,
    });
    const combatants = this.combatants.map(c => c.toObject());
    combatants.push(dummy.toObject());
    this.data.update({ combatants });
    return super._preCreate(data, options, user);
  }

  /**
   * Set all combatants to their max activations
   */
  async resetActivations(): Promise<LancerCombatant[]> {
    const module = LancerCombatTracker.config.module;
    const updates = this.combatants.map(c => {
      return {
        _id: c.id,
        [`flags.${module}.activations.value`]: c.getFlag(module, "activations.max"),
      };
    });
    // @ts-ignore Conversion is too fraught
    return this.updateEmbeddedDocuments("Combatant", updates);
  }

  /** @override */
  async startCombat(): Promise<this> {
    await this.resetActivations();
    return super.startCombat();
  }

  /** @override */
  async nextRound(): Promise<this> {
    await super.nextRound();
    await this.resetActivations();
    return this;
  }

  /** @override */
  async previousRound(): Promise<this> {
    await this.resetActivations();
    const round = Math.max(this.round - 1, 0);
    let advanceTime = 0;
    if (round > 0) advanceTime -= CONFIG.time.roundTime;
    return this.update({ round, turn: 0 }, { advanceTime });
  }

  /** @override */
  async resetAll(): Promise<this> {
    await this.resetActivations();
    return super.resetAll();
  }

  /**
   * Sets the active turn to the combatant passed by id or calls
   * {@link LancerCombat#requestActivation()} if the user does not have
   * permission to modify the combat
   */
  async activateCombatant(id: string): Promise<this> {
    const module = LancerCombatTracker.config.module;
    if (!game.user?.isGM) return this.requestActivation(id);
    const combatant = this.getEmbeddedDocument("Combatant", id);
    const activations = combatant?.getFlag(module, "activations") ?? {};
    if (!isActivations(activations)) throw new Error("Assertion failed for activation data");
    const val = activations.value;
    if (val === 0 || val === undefined) return this;
    await combatant?.setFlag(module, "activations", { value: val - 1, max: activations.max });
    const turn = this.turns.findIndex(t => t.id === id);
    return this.update({ turn });
  }

  /**
   * Calls any Hooks registered for "LancerCombatRequestActivate".
   */
  protected async requestActivation(id: string): Promise<this> {
    Hooks.callAll("LancerCombatRequestActivate", this, id);
    return this;
  }
}

export class LancerCombatant extends Combatant {
  /**
   * This just fixes a bug in foundry 0.8.x
   * @override
   */
  testUserPermission(user: User, _permission: string, _options: unknown): boolean {
    return this.actor?.testUserPermission(user, "update") ?? user.isGM;
  }

  /**
   * Prevent foundry from horribly exploding if this.parent is null
   * @override
   */
  prepareDerivedData(): void {
    if (!this.parent) return;
    super.prepareDerivedData();
  }

  /** @override */
  get isVisible(): boolean {
    const module = LancerCombatTracker.config.module;
    if (this.getFlag(module, "dummy") ?? false) return false;
    return super.isVisible;
  }

  /** @override */
  protected async _preCreate(
    data: ClientDocument["data"],
    options: unknown,
    user: User
  ): Promise<void> {
    const module = LancerCombatTracker.config.module;
    await super._preCreate(data, options, user);
    if (!this.parent) return;
    if (this.data.flags?.[module]?.activations === undefined)
      this.data.update({
        [`flags.${module}.activations`]: {
          max: this.actor?.getRollData()?.derived?.mm?.Activations ?? 1,
          value: 0,
        },
      });
  }

  /**
   * Adjusts the number of activations that a combatant can take
   * @param num - The number of maximum activations to add (can be negative)
   */
  async addActivations(num: number): Promise<this> {
    const module = LancerCombatTracker.config.module;
    if (num === 0) return this;
    const activations = <Activations | undefined>this.getFlag(module, "activations");
    return this.update({
      [`flags.${module}.activations`]: {
        max: Math.max((activations?.max ?? 1) + num, 1),
        value: Math.max((activations?.value ?? 0) + num, 0),
      },
    });
  }

  /**
   * Adjusts the number of current activations that a combatant has
   * @param num - The number of current activations to add (can be negative)
   */
  async modifyCurrentActivations(num: number): Promise<this> {
    const module = LancerCombatTracker.config.module;
    if (num === 0) return this;
    const activations = <Activations | undefined>this.getFlag(module, "activations");
    return this.update({
      [`flags.${module}.activations`]: {
        value: Math.clamped((activations?.value ?? 0) + num, 0, activations?.max ?? 1),
      },
    });
  }
}

/**
 * Interface for the activations object
 */
export interface Activations {
  max?: number;
  value?: number;
}

/**
 * Typeguard for activations flag of combatants
 */
export function isActivations(
  v: any // eslint-disable-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
  // eslint hates typeguards
): v is Activations {
  return (
    typeof v === "object" &&
    (typeof v.max === "undefined" || typeof v.max === "number") &&
    (typeof v.value === "undefined" || typeof v.value === "number")
  );
}
