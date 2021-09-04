import type { LancerInitiativeConfig } from "lancer-initiative";

declare global {
  interface LenientGlobalVariableTypes {
    game: never; // the type doesn't matter
  }

  namespace ClientSettings {
    interface Values {
      "lancer-initiative.combat-tracker-appearance": Partial<
        CONFIG["LancerInitiative"]["def_appearance"]
      >;
      "lancer-initiative.combat-tracker-sort": boolean;
      "lancer-initiative.combat-tracker-enable-initiative": boolean;
    }
  }

  interface CONFIG {
    LancerInitiative: LancerInitiativeConfig<"lancer-initiative">;
  }
}
