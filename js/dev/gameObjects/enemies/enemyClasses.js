goog.provide('EnemyClasses');

goog.require('EnemyDrone');
goog.require('EnemyTank');
goog.require('EnemyTurret');

/**
 * Exposes available Particle classes by String
 * @type {Object}
 */
EnemyClasses = {
	enemyDrone: EnemyDrone,
	enemyTank: EnemyTank,
	enemyTurret: EnemyTurret
};

goog.exportSymbol('EnemyClasses', EnemyClasses);
