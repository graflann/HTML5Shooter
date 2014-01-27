
goog.provide('EventNames');

/**
*@enum {number|string}
*/
EventNames = {
    PANEL_CHANGE:           'panelChange', 
    LOAD_COMPLETE:      	'loadComplete',
    SPAWN_COMPLETE:     	'spawnComplete',
    WAVE_COMPLETE:  		'waveComplete',
    LEVEL_COMPLETE:  		'levelComplete',
    ENEMY_KILLED:           'enemyKilled',
    COLLISION:              'collision', 
    WEAPON_SELECT: 			'weaponSelect',
    OPTION_SELECT:          'optionSelect', 
    ADD_HOMING_OVERLAY: 	'addHomingOverlay',
    REMOVE_HOMING_OVERLAY:  'removeHomingOverlay',
    ENERGY_CHANGE:          'energyChange',
    OVERDRIVE_CHANGE: 	    'overdriveChange',
    NEXT:               	'next',
    PREVIOUS:           	'previous',
    PLAY:               	'play',
    PAUSE:              	'pause'
};

goog.exportSymbol('EventNames', EventNames);
