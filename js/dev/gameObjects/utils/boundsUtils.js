goog.provide('BoundsUtils');

BoundsUtils.WIDTH_BUFFER = Constants.WIDTH * 0.25;
BoundsUtils.HEIGHT_BUFFER = Constants.HEIGHT * 0.25;
BoundsUtils.WIDTH = Constants.WIDTH + (BoundsUtils.WIDTH_BUFFER * 2);
BoundsUtils.HEIGHT = Constants.HEIGHT + (BoundsUtils.HEIGHT_BUFFER * 2);

BoundsUtils.checkBounds = function(pos, displayObject, camera) {
	var minX = -camera.position.x - BoundsUtils.WIDTH_BUFFER,
		minY = -camera.position.y - BoundsUtils.HEIGHT_BUFFER, 
		maxX = minX + BoundsUtils.WIDTH,
		maxY = minY + BoundsUtils.HEIGHT; 

	displayObject.visible = !((pos.x < minX || pos.x > maxX) || (pos.y < minY || pos.y > maxY));
};