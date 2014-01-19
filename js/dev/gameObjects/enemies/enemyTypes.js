goog.provide('EnemyTypes');

/**
 * Exposes available Enemy classes by String
 * @type {Object}
 */
EnemyTypes = {
	TROOPER: 	'enemyTrooper',
	TANK: 		'enemyTank',
	TURRET: 	'enemyTurret',
	COPTER: 	'enemyCopter',
	CENTIPEDE: 	'enemyCentipede',
	CARRIER: 	'enemyCarrier',
};

goog.exportSymbol('EnemyTypes', EnemyTypes);
