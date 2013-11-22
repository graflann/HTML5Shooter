goog.provide('ItemClasses');

goog.require('EnergyItem');

/**
 * Exposes available Particle classes by String
 * @type {Object}
 */
ItemClasses = {
	energy: EnergyItem,
};

goog.exportSymbol('ItemClasses', ItemClasses);
