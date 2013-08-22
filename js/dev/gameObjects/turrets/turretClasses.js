goog.provide('TurretClasses');

goog.require('VulcanTurret');
goog.require('SpreadTurret');
goog.require('GrenadeTurret');
goog.require('BladeTurret');
goog.require('SniperTurret');

/**
 * Exposes available Turret classes by String
 * @type {Object}
 */
TurretClasses = {
	vulcan: 	VulcanTurret,
	spread: 	SpreadTurret,
	grenade: 	GrenadeTurret,
	blade: 		BladeTurret,
	sniper: 	SniperTurret
};

goog.exportSymbol('TurretClasses', TurretClasses);
