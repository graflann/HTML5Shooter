goog.provide('EnemyTypes');

/**
 * Exposes available Particle classes by String
 * @type {Object}
 */
EnemyTypes = {
	TANK: 	'enemyTank',
	TURRET: 'enemyTurret',
	COPTER: 'enemyCopter',
	CENTIPEDE: 'enemyCentipede'
};

goog.exportSymbol('EnemyTypes', EnemyTypes);
