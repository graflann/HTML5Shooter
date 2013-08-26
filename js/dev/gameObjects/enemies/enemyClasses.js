goog.provide('EnemyClasses');

goog.require('EnemyDrone');
goog.require('EnemyTank');
goog.require('EnemyTurret');
goog.require('EnemyCopter');

/**
 * Exposes available Particle classes by String
 * @type {Object}
 */
EnemyClasses = {
	enemyDrone: EnemyDrone,
	enemyTank: EnemyTank,
	enemyTurret: EnemyTurret,
	enemyCopter: EnemyCopter
};

goog.exportSymbol('EnemyClasses', EnemyClasses);
