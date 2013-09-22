goog.provide('ParticleClasses');

goog.require('ExplosionParticle');
goog.require('ReticleParticle');
goog.require('HitParticle');

/**
 * Exposes available Particle classes by String
 * @type {Object}
 */
ParticleClasses = {
	explosion: ExplosionParticle,
	reticle: ReticleParticle,
	hit: HitParticle
};

goog.exportSymbol('ParticleClasses', ParticleClasses);
