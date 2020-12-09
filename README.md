Lancer Initiative
=================
![Forge installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Flancer-initiative)

Lancer's initiative system for Foundry VTT. While intended for Lancer, this can be used to get popcorn style initiative on any system by changing the icon the module uses in the settings (`fas fa-chevron-circle-right li-icon` is a nice generic choice.) 

Lancer Initiative makes the following changes to the Foundry VTT turn tracker:

 * Sorts the initiative tracker by token disposition and then token name. The order is players, then neutrals, then hostiles. Setting the initiative for an entry can change the sort order from within the category.
 * Replaces the Roll Initiative button and initiative display with an activation button. Clicking the button will set the current initiative to that token. Buttons are color coded by faction and greyed out for tokens that have already acted.
 * Adds options to the combatant context menu to add, remove and reset activations.
 
![Screenshot](https://github.com/BoltsJ/lancer-initiative/blob/default/screenshot.png?raw=true)

Installation
------------

### Recommended

Install from the Foundry module installation dialog by searching for ‘Lancer Initiative’.

### Manual

Paste the following url into the install module dialog in Foundry VTT: https://github.com/BoltsJ/lancer-initiative/releases/latest/download/module.json

Known issues
------------

 * **Combat Enhancements** is incompatible pending [this issue](https://gitlab.com/asacolips-projects/foundry-mods/combat-enhancements/-/issues/10). Drag and drop from combat enhancements does not work as this does't use initiative values.
 * **Status Icon Counters** does not track turns properly when used with this module. 
