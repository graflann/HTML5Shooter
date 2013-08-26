goog.provide('EnemyTypes');

/**
 * Exposes available Particle classes by String
 * @type {Object}
 */
EnemyTypes = {
	DRONE: 	'enemyDrone',
	TANK: 	'enemyTank',
	TURRET: 'enemyTurret',
	COPTER: 'enemyCopter'
};

goog.exportSymbol('EnemyTypes', EnemyTypes);
