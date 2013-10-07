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
    DEBUG: 			"debug"
};

goog.exportSymbol('LayerTypes', LayerTypes);