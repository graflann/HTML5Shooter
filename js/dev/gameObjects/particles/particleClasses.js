goog.provide('ParticleClasses');

goog.require('ExplosionParticle');
goog.require('ReticleParticle');
goog.require('HitParticle');
goog.require('GrenadeParticle');
goog.require('PickUpParticle');

/**
 * Exposes available Particle classes by String
 * @type {Object}
 */
ParticleClasses = {
	explosion: 	ExplosionParticle,
	reticle: 	ReticleParticle,
	hit: 		HitParticle,
	grenade: 	GrenadeParticle,
	pickUp: 	PickUpParticle
};

goog.exportSymbol('ParticleClasses', ParticleClasses);
