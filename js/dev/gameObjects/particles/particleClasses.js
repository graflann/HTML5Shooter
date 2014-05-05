goog.provide('ParticleClasses');

goog.require('ExplosionParticle');
goog.require('ReticleParticle');
goog.require('HitParticle');
goog.require('GrenadeParticle');
goog.require('PickUpParticle');
goog.require('BoostParticle');
goog.require('SpawnGeneratorParticle');

/**
 * Exposes available Particle classes by String
 * @type {Object}
 */
ParticleClasses = {
	explosion: 		ExplosionParticle,
	reticle: 		ReticleParticle,
	hit: 			HitParticle,
	grenade: 		GrenadeParticle,
	pickUp: 		PickUpParticle,
	boost: 			BoostParticle,
	spawnGenerator: SpawnGeneratorParticle
};

goog.exportSymbol('ParticleClasses', ParticleClasses);
