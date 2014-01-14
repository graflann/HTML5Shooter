goog.provide('EnemyTypes');

/**
 * Exposes available Particle classes by String
 * @type {Object}
 */
EnemyTypes = {
	TROOPER: 	'enemyTrooper',
	TANK: 		'enemyTank',
	TURRET: 	'enemyTurret',
	COPTER: 	'enemyCopter',
	CENTIPEDE: 	'enemyCentipede'
};

goog.exportSymbol('EnemyTypes', EnemyTypes);
