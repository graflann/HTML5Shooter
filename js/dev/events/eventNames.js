
goog.provide('EventNames');

/**
*@enum {number|string}
*/
EventNames = {
    LOAD_COMPLETE:      	'loadComplete',
    SPAWN_COMPLETE:     	'spawnComplete',
    WAVE_COMPLETE:  		'waveComplete',
    LEVEL_COMPLETE:  		'levelComplete',
    WEAPON_SELECT: 			'weaponSelect',
    ADD_HOMING_OVERLAY: 	'addHomingOverlay',
    REMOVE_HOMING_OVERLAY: 	'removeHomingOverlay',
    NEXT:               	'next',
    PREVIOUS:           	'previous',
    PLAY:               	'play',
    PAUSE:              	'pause'
};

goog.exportSymbol('EventNames', EventNames);
