goog.provide('ProjectileClasses');

goog.require('VulcanProjectile');
goog.require('SpreadProjectile');
goog.require('GrenadeProjectile');
goog.require('BladeProjectile');
goog.require('SniperProjectile');
goog.require('HomingProjectile');

/**
 * Exposes available Projectile classes by String
 * @type {Object}
 */
ProjectileClasses = {
	vulcan: VulcanProjectile,
	spread: SpreadProjectile,
	grenade: GrenadeProjectile,
	blade: BladeProjectile,
	sniper: SniperProjectile,
	homing: HomingProjectile

   /*kazan: 	KazanProjectile, 	volcano
   jihsin: 		JishinProjectile, 	earthquake
   denpa: 		DenpaProjectile, 	electromagnetic wave
   yaiba: 		YaibaProjectile, 	blade
   raiden: 		RaidenProjectile    lightening bolt*/
};

goog.exportSymbol('ProjectileClasses', ProjectileClasses);
