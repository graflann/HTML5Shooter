goog.provide('ItemClasses');

goog.require('EnergyItem');
goog.require('OverdriveItem');
goog.require('HealthItem');

/**
 * Exposes available Particle classes by String
 * @type {Object}
 */
ItemClasses = {
	energy: 	EnergyItem,
	overdrive: 	OverdriveItem,
	health: 	HealthItem
};

goog.exportSymbol('ItemClasses', ItemClasses);
