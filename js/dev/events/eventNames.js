
goog.provide('EventNames');

/**
*@enum {number|string}
*/
EventNames = {
    PANEL_CHANGE:               'panelChange', 
    LOAD_COMPLETE:              'loadComplete',
    PANEL_LOAD_COMPLETE:        'panelLoadComplete',
    CLEAR_COMPLETE:      	    'clearComplete',
    SPAWN_COMPLETE:     	    'spawnComplete',
    WAVE_COMPLETE:  		    'waveComplete',
    LEVEL_COMPLETE:  		    'levelComplete',
    ENEMY_KILLED:               'enemyKilled',
    COLLISION:                  'collision', 
    WEAPON_SELECT: 			    'weaponSelect',
    OPTION_SELECT:              'optionSelect', 
    ADD_HOMING_OVERLAY:         'addHomingOverlay',
    INCREASE_HOMING_OVERLAY: 	'increaseHomingOverlay',
    REMOVE_HOMING_OVERLAY:      'removeHomingOverlay',
    ENERGY_CHANGE:              'energyChange',
    OVERDRIVE_CHANGE:           'overdriveChange',
    UPDATE_SCORE:               'updateScore',
    UPDATE_BONUS:               'updateBonus',
    INIT_WARNING:               'initWarning',
    END_WARNING:                'endWarning',
    GAME_OVER: 	                'gameOver',
    NEXT:               	    'next',
    PREVIOUS:           	    'previous',
    PLAY:               	    'play',
    PAUSE:              	    'pause'
};

goog.exportSymbol('EventNames', EventNames);
