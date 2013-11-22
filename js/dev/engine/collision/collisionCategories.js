goog.provide('CollisionCategories');

/**
*@enum {string}
*/
CollisionCategories = {
    SCENE_OBJECT:       		0x0001,
    PLAYER:        				0x0002,
    PLAYER_BASE:        		0x0004,
    GROUND_ENEMY: 				0x0008,
    GROUND_ENEMY_BASE:          0x0010,
    AIR_ENEMY: 					0x0020, //can also be elevated
    PLAYER_PROJECTILE:  		0x0040,
    GROUND_ENEMY_PROJECTILE: 	0x0080,
    AIR_ENEMY_PROJECTILE: 		0x0100, 
    HOMING_OVERLAY: 			0x0200,
    HOMING_PROJECTILE: 			0x0400,
    ITEM:                       0x0800            
};

goog.exportSymbol('CollisionCategories', CollisionCategories);