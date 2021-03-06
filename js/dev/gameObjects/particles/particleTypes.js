goog.provide('ParticleTypes');

/**
*@enum {String}
*/
ParticleTypes = {
    EXPLOSION: 			'explosion',
    RETICLE: 			'reticle',
    HIT: 				'hit',
    GRENADE: 			'grenade',
    PICK_UP: 			'pickUp',
    BOOST: 				'boost',
    SPAWN_GENERATOR:  	'spawnGenerator',
    PARRY: 				'parry' 
};

goog.exportSymbol('ParticleTypes', ParticleTypes);
