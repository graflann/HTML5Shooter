goog.provide('SceneObjectClasses');

goog.require('Wall');
goog.require('Tower');

/**
 * Exposes available SceneObject classes by String
 * @type {Object}
 */
SceneObjectClasses = {
	wall: Wall,
	tower: Tower
};

goog.exportSymbol('SceneObjectClasses', SceneObjectClasses);
