goog.provide('ItemClasses');

goog.require('EnergyItem');
goog.require('OverdriveItem');

/**
 * Exposes available Particle classes by String
 * @type {Object}
 */
ItemClasses = {
	energy: 	EnergyItem,
	overdrive: 	OverdriveItem
};

goog.exportSymbol('ItemClasses', ItemClasses);
