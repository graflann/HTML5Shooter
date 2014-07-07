goog.provide('LayerTypes');

/**
* Listed in render order 
*@enum {string}
*/
LayerTypes = {
    BACKGROUND:		"background",
    MAIN:			"main",
    PROJECTILE:		"projectile",
    FOREGROUND:		"foreground",
    HOMING:			"homing",
    PATHING: 		"pathing", 
    HUD:			"hud",
    SHADOW:			"shadow",
    AIR:			"air",
    DEBUG:          "debug",
    INPUT: 			"input",
    LOADING:        "loading",
    MODAL:          "modal"
};

goog.exportSymbol('LayerTypes', LayerTypes);