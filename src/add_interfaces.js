/**
 * Manually insert the overridden methods from LancerCombat into the passed
 * class
 */
export function add_combat_interface(system_combat_class) {
  const LancerCombat = CONFIG.Combat.documentClass;
  class CustomLancerCombat extends system_combat_class {}

  Object.getOwnPropertyNames(LancerCombat.prototype)
    .filter(n => n !== "constructor")
    .forEach(method =>
      Object.defineProperty(
        CustomLancerCombat.prototype,
        method,
        Object.getOwnPropertyDescriptor(LancerCombat.prototype, method)
      )
    );

  return CustomLancerCombat;
}

/**
 * Manually insert the overridden methods from LancerCombatant into the passed
 * class
 */
export function add_combatant_interface(system_combatant_class) {
  const LancerCombatant = CONFIG.Combatant.documentClass;
  class CustomLancerCombatant extends system_combatant_class {}

  Object.getOwnPropertyNames(LancerCombatant.prototype)
    .filter(n => n !== "constructor")
    .forEach(method =>
      Object.defineProperty(
        CustomLancerCombatant.prototype,
        method,
        Object.getOwnPropertyDescriptor(LancerCombatant.prototype, method)
      )
    );

  return CustomLancerCombatant;
}
