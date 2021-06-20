import { LancerCombatTracker } from "./module/lancer-combat-tracker";
import "jquery";

declare global {
  namespace ClientSettings {
    interface Values {
      "lancer-initiative.combat-tracker-appearance": Partial<typeof LancerCombatTracker.appearance>;
      "lancer-initiative.combat-tracker-sort": boolean;
      "lancer-initiative.combat-tracker-enable-initiative": boolean;
    }
  }

  interface Math {
    clamped(n: numebr, min: number, max: number): number;
  }

  var game: {
    combats: any;
    i18n: {
      localize(key: string): string;
    };
    settings: {
      get(scope: string, key: string): unknown;
      set(scope: string, key: string, value: unknown): Promise<void>;
      register(
        scope: string,
        name: string,
        data: {
          name?: string;
          hint?: string;
          scope: string;
          config: boolean;
          type: unknown;
          default?: unknown;
          onChange?: (...args: any) => void;
        }
      ): void;
      registerMenu(
        scope: string,
        name: string,
        data: {
          name?: string;
          label?: string;
          type: unknown;
          restricted?: boolean;
        }
      ): void;
    };
    system: {
      id: string;
    };
    user: User | null;
  };

  var CONFIG: {
    Combat: {
      documentClass: new (...args: any) => Combat;
      initiative: {
        formula: string | null;
      };
    };
    Combatant: {
      documentClass: new (...args: any) => Combatant;
    };
    time: {
      turnTime: number;
      roundTime: number;
    };
    ui: {
      combat: new (...args: any) => CombatTracker;
    };
  };

  /**
   * A simple event framework used throughout Foundry Virtual Tabletop.
   * When key actions or events occur, a "hook" is defined where user-defined callback functions can execute.
   * This class manages the registration and execution of hooked callback functions.
   */
  export class Hooks {
    /**
     * Call all hook listeners in the order in which they were registered
     * Hooks called this way can not be handled by returning false and will always trigger every hook callback.
     *
     * @param hook - The hook being triggered
     * @param args - Arguments passed to the hook callback functions
     * @returns Were all hooks called without execution being prevented?
     */
    static callAll(hook: string, ...args: any): true;
    /**
     * Register a callback handler for an event which is only triggered once the first time the event occurs.
     * After a "once" hook is triggered the hook is automatically removed.
     *
     * @param hook - The unique name of the hooked event
     * @param fn   - The callback function which should be triggered when the hook event occurs
     * @return An ID number of the hooked function which can be used to turn off the hook later
     */
    static once(hook: string, fn: (...args: any) => void | boolean): number;
  }

  class ClientDocument {
    data: {
      update(data: object, context?: object): unknown;
      [x: string]: any;
    };
    parent: ClientDocument | null;

    get id(): string;

    testUserPermission(user: User, permission: string, options?: unknown): boolean;
    toObject(): object;
    protected _onCreate(data: this["data"], options: unknown, user: User): void;
    protected _preCreate(data: this["data"], options: unknown, user: User): Promise<void>;
    setFlag(scope: string, key: string, value: unknown): Promise<this>;
    getFlag(scope: string, key: string): unknown;

    update(data: Record<string, unknown>, options?: Record<string, unknown>): Promise<this>;

    getEmbeddedDocument(document: string, id: string): ClientDocument | undefined;
    updateEmbeddedDocuments(
      document: string,
      data: ClientDocument["data"][]
    ): Promise<ClientDocument[]>;

    prepareBaseData(): void;
    prepareDerivedData(): void;
  }

  export class Combat extends ClientDocument {
    turns: Combatant[];
    get combatants(): Combatant[];
    get combatant(): Combatant;
    get round(): number;
    protected _sortCombatants(a: Combatant, b: Combatant): number;

    getEmbeddedDocument(document: "Combatant", id: string): Combatant | undefiend;

    startCombat(): Promise<this>;
    nextRound(): Promise<this>;
    previousRound(): Promise<this>;
    resetAll(): Promise<this>;
  }

  export class Combatant extends ClientDocument {
    parent: Combat | null;
    get actor(): Actor | null;
    get token(): Token | null;

    get isVisible(): boolean;
  }

  export class User extends ClientDocument {
    get isGM(): boolean;
  }

  export class CombatTracker {
    viewed: Combat | null;

    get combats(): Combat[];

    getData(options: unknown): Promise<object>;
    activateListeners(html: JQuery<HTMLElement>): void;

    protected _renderInner(data: object): Promise<JQuery<HTMLElement>>;
    protected _getEntryContextOptions(): {
      name: string;
      icon: string;
      callback: (...args: any) => unknown;
    }[];
  }

  class FormApplication {
    static get defaultOptions(): object;
    activateListeners(html: JQuery<HTMLElement>): void;
    render(): void;
  }

  function diffObject(a: object, b: object, options: object): object;
}
