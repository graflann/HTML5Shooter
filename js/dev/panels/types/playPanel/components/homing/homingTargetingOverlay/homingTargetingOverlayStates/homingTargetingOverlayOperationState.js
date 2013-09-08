goog.provide('HomingTargetingOverlayOperationState');

goog.require('State');

/**
*@constructor
*There are methods to provide logic during an entry point, an update loop, and an exit point 
*/
HomingTargetingOverlayOperationState = function(hto) {
	this.hto = hto;

	this.scalar = 0.05;
};

goog.inherits(HomingTargetingOverlayOperationState, State);

HomingTargetingOverlayOperationState.KEY = "operation";

/**
*@public
*/
HomingTargetingOverlayOperationState.prototype.enter = function(options) {
	var hto = this.hto;

	//TOP RETICLE
	if(hto.arrReticles[0].graphics.isEmpty()) {
		hto.arrReticles[0].graphics
			.ss(4)
			.s(Constants.LIGHT_BLUE)
			.dc(0, 0, hto.radius)
			.mt(0, 0)
			.dc(0, 0, hto.radius * 0.5)
			.mt(0, 0)
			.lt(hto.radius, 0)
			.mt(0, 0)
			.lt(0, hto.radius);
	}

	//BOTTOM RETICLE
	if(hto.arrReticles[1].graphics.isEmpty()) {
		hto.arrReticles[1].graphics
			.ss(4)
			.s(Constants.DARK_BLUE)
			.mt(0, 0)
			.lt(hto.radius, 0)
			.mt(0, 0)
			.lt(0, hto.radius);
	}

	//MIDDLE ANIMATED ELLIPSE
	if(hto.arrReticles[2].graphics.isEmpty()) {
		hto.arrReticles[2].graphics
			.ss(4)
			.s(Constants.BLUE)
			.dc(0, 0, hto.radius);
	}

	hto.container.addChild(hto.arrReticles[1]);
	hto.container.addChild(hto.arrReticles[2]);
	hto.container.addChild(hto.arrReticles[0]);

	hto.body.SetAwake(true);
	hto.body.SetActive(true);
};

/**
*@public
*/
HomingTargetingOverlayOperationState.prototype.update = function(options) {
	var hto = this.hto,
		scale = app.physicsScale,
		reticle2 = hto.arrReticles[2];

	//ROTATE TOP AND BOTTOM
	hto.arrReticles[0].rotation += 4;
	hto.arrReticles[1].rotation -= 2;

	//ROTATE AND SCALE MIDDLE
	reticle2.rotation += 3;

	if(reticle2.scaleX <  -1) {
		reticle2.scaleX = -1;
		this.scalar *= -1;
	} else if(reticle2.scaleX >  1) {
		reticle2.scaleX = 1;
		this.scalar *= -1;
	}

	reticle2.scaleX += this.scalar;

	//UPDATE POSITION OF COLLISION BODY
	hto.physicalPosition.x = hto.position.x / scale;
	hto.physicalPosition.y = hto.position.y / scale;

	hto.body.SetPosition(hto.physicalPosition);
};

/**
*@public
*/
HomingTargetingOverlayOperationState.prototype.exit = function(options) {
	var hto = this.hto;

	hto.container.removeChild(hto.arrReticles[0]);
	hto.container.removeChild(hto.arrReticles[1]);
	hto.container.removeChild(hto.arrReticles[2]);

	hto.arrReticles[0].graphics.clear();
	hto.arrReticles[1].graphics.clear();
	hto.arrReticles[2].graphics.clear();

	hto.body.SetAwake(false);
	hto.body.SetActive(false);
};

goog.exportSymbol('HomingTargetingOverlayOperationState', 
	HomingTargetingOverlayOperationState);