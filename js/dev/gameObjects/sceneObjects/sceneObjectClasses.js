goog.provide('SceneObjectClasses');

goog.require('Brick');
goog.require('Tower');

/**
 * Exposes available SceneObject classes by String
 * @type {Object}
 */
SceneObjectClasses = {
	brick: Brick,
	tower: Tower
};

goog.exportSymbol('SceneObjectClasses', SceneObjectClasses);
