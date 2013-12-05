goog.provide('ParticleClasses');

goog.require('ExplosionParticle');
goog.require('ReticleParticle');
goog.require('HitParticle');
goog.require('GrenadeParticle');

/**
 * Exposes available Particle classes by String
 * @type {Object}
 */
ParticleClasses = {
	explosion: ExplosionParticle,
	reticle: ReticleParticle,
	hit: HitParticle,
	grenade: GrenadeParticle
};

goog.exportSymbol('ParticleClasses', ParticleClasses);
