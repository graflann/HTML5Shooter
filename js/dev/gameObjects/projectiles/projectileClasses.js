goog.provide('ProjectileClasses');

goog.require('VulcanProjectile');
goog.require('HunterProjectile');
goog.require('SpreadProjectile');
goog.require('ReflectProjectile');
goog.require('GrenadeProjectile');
goog.require('BladeProjectile');
goog.require('RotarySawProjectile');
goog.require('SniperProjectile');
goog.require('LaserProjectile');
goog.require('HomingProjectile');
goog.require('EnemyProjectile');

/**
 * Exposes available Projectile classes by String
 * @type {Object}
 */
ProjectileClasses = {
	vulcan: VulcanProjectile,
	hunter: HunterProjectile,
	spread: SpreadProjectile,
	reflect: ReflectProjectile,
	grenade: GrenadeProjectile,
	blade: BladeProjectile,
	rotarySaw: RotarySawProjectile,
	sniper: SniperProjectile,
	laser: LaserProjectile,
	homing: HomingProjectile,
	enemy: EnemyProjectile
};

goog.exportSymbol('ProjectileClasses', ProjectileClasses);
