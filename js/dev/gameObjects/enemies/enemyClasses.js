goog.provide('EnemyClasses');

goog.require('EnemyTank');
goog.require('EnemyTrooper');
goog.require('EnemyRanger');
goog.require('EnemyFencer');
goog.require('EnemyTurret');
goog.require('EnemyCopter');
goog.require('EnemyCentipede');
goog.require('EnemyCarrier');

/**
 * Exposes available Particle classes by String
 * @type {Object}
 */
EnemyClasses = {
	enemyTank: 		EnemyTank,
	enemyTrooper: 	EnemyTrooper,
	enemyRanger: 	EnemyRanger,
	enemyFencer: 	EnemyFencer,
	enemyTurret: 	EnemyTurret,
	enemyCopter: 	EnemyCopter,
	enemyCentipede: EnemyCentipede,
	enemyCarrier: 	EnemyCarrier
};

goog.exportSymbol('EnemyClasses', EnemyClasses);
