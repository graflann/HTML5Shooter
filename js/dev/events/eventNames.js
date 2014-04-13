
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
    FORCED_KILL:                'forcedKill',
    COMPONENT_DESTROYED:        'componentDestroyed',
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
    INIT_SPAWN_PARTICLE:        'initSpawnParticle',
    REMOVE_SPAWN_PARTICLE:      'removeSpawnParticle',
    GAMEPAD_SUPPORT_UNAVAILABLE:'gamepadSupportUnavailable',
    GAMEPAD_STATUS_CHANGED:     'gamepadStatusChanged',
    VALIDATE_GAMEPAD_INPUT:     'validateGamepadInput',
    GAME_OVER: 	                'gameOver',
    NEXT:               	    'next',
    PREVIOUS:           	    'previous',
    PLAY:               	    'play',
    PAUSE:              	    'pause'
};

goog.exportSymbol('EventNames', EventNames);
