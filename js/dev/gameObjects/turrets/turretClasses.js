goog.provide('TurretClasses');

goog.require('VulcanTurret');
goog.require('SpreadTurret');
goog.require('BladeTurret');
goog.require('SniperTurret');
goog.require('EnemyVulcanTurret');

/**
 * Exposes available Turret classes by String
 * @type {Object}
 */
TurretClasses = {
	vulcan: 		VulcanTurret,
	spread: 		SpreadTurret,
	blade: 			BladeTurret,
	sniper: 		SniperTurret,
	enemyVulcan: 	EnemyVulcanTurret
};

goog.exportSymbol('TurretClasses', TurretClasses);
