import { add_combat_interface } from "./add_interfaces";

export function setup(combat_class) {
  console.log(`${CONFIG.LancerInitiative.module} | Setting up starwarsffg integration`);

  const LancerCombatFFG = add_combat_interface(combat_class);
  CONFIG.Combat.documentClass = LancerCombatFFG;
}
