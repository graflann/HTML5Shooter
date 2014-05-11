goog.provide('EnemyTypes');

/**
 * Exposes available Enemy classes by String
 * @type {Object}
 */
EnemyTypes = {
	TROOPER: 	'enemyTrooper',
	RANGER: 	'enemyRanger',
	FENCER: 	'enemyFencer',
	TANK: 		'enemyTank',
	TURRET: 	'enemyTurret',
	COPTER: 	'enemyCopter',
	CENTIPEDE: 	'enemyCentipede',
	CARRIER: 	'enemyCarrier'
};

goog.exportSymbol('EnemyTypes', EnemyTypes);
