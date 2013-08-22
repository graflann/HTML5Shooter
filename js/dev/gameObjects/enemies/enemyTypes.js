goog.provide('EnemyTypes');

/**
 * Exposes available Particle classes by String
 * @type {Object}
 */
EnemyTypes = {
	DRONE: 	'enemyDrone',
	TANK: 	'enemyTank',
	TURRET: 'enemyTurret'
};

goog.exportSymbol('EnemyTypes', EnemyTypes);
