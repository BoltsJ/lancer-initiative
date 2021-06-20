import { LancerCombat, LancerCombatant, isActivations } from "./lancer-combat.js";

/**
 * Overrides the display of the combat and turn order tab to add activation
 * buttons and either move or remove the initiative button
 */
export class LancerCombatTracker extends CombatTracker {
  viewed!: LancerCombat | null;
  /**
   * Intercepts the data being sent to the combat tracker window and
   * optionally sorts the the turn data that gets displayed. This allows the
   * units that have already gone to be moved to the bottom without the risk of
   * updateCombat events being eaten.
   * @override
   */
  async getData(options?: unknown): Promise<object> {
    const config = (this.constructor as typeof LancerCombatTracker).config;
    const appearance = (this.constructor as typeof LancerCombatTracker).appearance;
    const data = (await super.getData(options)) as {
      turns: {
        id: string;
        css: string;
        pending: number;
        finished: number;
      }[];
      [x: string]: unknown;
    };
    const sort = game.settings.get(config.module, "combat-tracker-sort") as boolean;
    const disp: Record<number, string> = {
      [-1]: "enemy",
      [0]: "neutral",
      [1]: "player",
    };
    data.turns = data.turns.map(t => {
      const combatant = this.viewed!.getEmbeddedDocument("Combatant", t.id);
      const activations = combatant.getFlag(config.module, "activations");
      if (!isActivations(activations)) return t;
      return {
        ...t,
        css: t.css + " " + disp[combatant.token?.data.disposition ?? 0],
        pending: activations.value ?? 0,
        finished: (activations.max ?? 1) - (activations.value ?? 0),
      };
    });
    if (sort) {
      // Not sure why these need to be annotated
      data.turns.sort(function (a, b) {
        const aa = a.css.indexOf("active") !== -1 ? 1 : 0;
        const ba = b.css.indexOf("active") !== -1 ? 1 : 0;
        if (ba - aa !== 0) return ba - aa;
        const ad = a.pending === 0 ? 1 : 0;
        const bd = b.pending === 0 ? 1 : 0;
        return ad - bd;
      });
    }
    data.icon_class = appearance.icon;
    return data;
  }

  /**
   * Make all the changes to the combat tracker before setting up event
   * handlers.
   * @override
   */
  protected async _renderInner(data: object): Promise<JQuery<HTMLElement>> {
    const config = (this.constructor as typeof LancerCombatTracker).config;
    const appearance = (this.constructor as typeof LancerCombatTracker).appearance;
    const html = await super._renderInner(data);
    const settings = {
      icon: appearance.icon,
      enable_initiative: game.settings.get(
        config.module,
        "combat-tracker-enable-initiative"
      ) as boolean,
    };
    html.find(".combatant").each(function (): void {
      const combatantId = $(this).data("combatantId") as string;
      // @ts-ignore 0.8
      const combatant = data.combat!.getEmbeddedDocument("Combatant", combatantId);
      const activations: unknown = combatant.getFlag(config.module, "activations");
      if (!isActivations(activations)) return;

      // render icons
      const n = activations.value ?? 0;
      const d = (activations.max ?? 1) - n;
      $(this)
        .find(".token-initiative")
        .attr("data-control", "activate")
        .html(
          `<a class="${settings.icon}"></a>`.repeat(n) +
            `<i class="${settings.icon} done"></i>`.repeat(d)
        );

      if (
        settings.enable_initiative &&
        combatant.permission === 3 &&
        combatant.initiative === null
      ) {
        const init_button = document.createElement("a");
        $(this).find(".combatant-controls").prepend($(init_button));
        $(init_button)
          .addClass("combatant-control")
          .attr("data-control", "rollInitiative")
          .prop("title", game.i18n.localize("COMBAT.InitiativeRoll"))
          .html('<i class="fas fa-dice-d20"></i>');
      } else if (settings.enable_initiative && combatant.initiative !== null) {
        const init_val = document.createElement("span");
        $(this).find(".combatant-controls").prepend($(init_val));
        $(init_val).addClass("initiative").css("flex", "0 0 1.5em").text(combatant.initiative);
      }
    });
    return html;
  }

  /** @override */
  activateListeners(html: JQuery<HTMLElement>): void {
    super.activateListeners(html);
    html.find(".token-initiative").on("click", this._onActivateCombatant.bind(this));
  }

  /**
   * Activate the selected combatant
   */
  protected async _onActivateCombatant(
    event: JQuery.ClickEvent<HTMLElement, undefined, HTMLElement, HTMLElement>
  ): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    const btn = event.currentTarget;
    const id = btn.closest<HTMLElement>(".combatant")?.dataset.combatantId;
    if (!id) return;
    await this.viewed!.activateCombatant(id);
  }

  protected async _onAddActivation(li: JQuery<HTMLElement>): Promise<void> {
    const combatant: LancerCombatant = this.viewed!.getEmbeddedDocument(
      "Combatant",
      li.data("combatant-id")
    );
    await combatant.addActivations(1);
  }

  protected async _onRemoveActivation(li: JQuery<HTMLElement>): Promise<void> {
    const combatant: LancerCombatant = this.viewed!.getEmbeddedDocument(
      "Combatant",
      li.data("combatant-id")
    );
    await combatant.addActivations(-1);
  }

  protected async _onUndoActivation(li: JQuery<HTMLElement>): Promise<void> {
    const combatant: LancerCombatant = this.viewed!.getEmbeddedDocument(
      "Combatant",
      li.data("combatant-id")
    );
    await combatant.modifyCurrentActivations(1);
  }

  /** @override */
  protected _getEntryContextOptions(): {
    name: string;
    icon: string;
    callback: (...args: any) => unknown;
  }[] {
    const m: {
      name: string;
      icon: string;
      callback: (...args: any) => unknown;
    }[] = [
      {
        name: game.i18n.localize("LANCERINITIATIVE.AddActivation"),
        icon: '<i class="fas fa-plus"></i>',
        callback: this._onAddActivation.bind(this),
      },
      {
        name: game.i18n.localize("LANCERINITIATIVE.RemoveActivation"),
        icon: '<i class="fas fa-minus"></i>',
        callback: this._onRemoveActivation.bind(this),
      },
      {
        name: game.i18n.localize("LANCERINITIATIVE.UndoActivation"),
        icon: '<i class="fas fa-undo"></i>',
        callback: this._onUndoActivation.bind(this),
      },
    ];
    m.push(...super._getEntryContextOptions().filter(i => i.name !== "COMBAT.CombatantReroll"));
    return m;
  }

  /**
   * Get the current appearance data from settings
   */
  static get appearance(): LIConfig["def_appearance"] {
    const config = (this.prototype.constructor as typeof LancerCombatTracker).config;
    return {
      ...config.def_appearance,
      ...(game.settings.get(config.module, "combat-tracker-appearance") as Partial<
        LIConfig["def_appearance"]
      >),
    };
  }

  /**
   * Holds the default configuration of the module
   */
  static config: LIConfig = {
    module: "",
    def_appearance: {
      icon: "fas fa-chevron-circle-right",
      icon_size: 1.5,
      player_color: "#44abe0",
      neutral_color: "#146464",
      enemy_color: "#d98f30",
      done_color: "#444444",
    },
  };
}

interface LIConfig {
  module: string;
  def_appearance: {
    icon: string;
    icon_size: number;
    player_color: string;
    neutral_color: string;
    enemy_color: string;
    done_color: string;
  };
}
