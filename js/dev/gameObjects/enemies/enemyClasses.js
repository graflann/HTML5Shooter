goog.provide('EnemyClasses');

goog.require('EnemyTank');
goog.require('EnemyTrooper');
goog.require('EnemyTurret');
goog.require('EnemyCopter');
goog.require('EnemyCentipede');

/**
 * Exposes available Particle classes by String
 * @type {Object}
 */
EnemyClasses = {
	enemyTank: 		EnemyTank,
	enemyTrooper: 	EnemyTrooper,
	enemyTurret: 	EnemyTurret,
	enemyCopter: 	EnemyCopter,
	enemyCentipede: EnemyCentipede
};

goog.exportSymbol('EnemyClasses', EnemyClasses);
