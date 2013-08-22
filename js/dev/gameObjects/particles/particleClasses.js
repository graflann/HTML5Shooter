goog.provide('ParticleClasses');

goog.require('ExplosionParticle');
goog.require('ReticleParticle');

/**
 * Exposes available Particle classes by String
 * @type {Object}
 */
ParticleClasses = {
	explosion: ExplosionParticle,
	reticle: ReticleParticle
};

goog.exportSymbol('ParticleClasses', ParticleClasses);
