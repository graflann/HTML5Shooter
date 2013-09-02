goog.provide('HomingProjectile');

goog.require('Projectile');

/**
*@constructor
*Ammo for Turret instaces
*/
HomingProjectile = function(colors, categoryBits, maskBits) {
	Projectile.call(this, colors, categoryBits, maskBits);

	/**
	*physical body added to Box2D physicsWorld
	*@type {}
	*/
	this.velocityMod = 12;

	this.arrTrails = new Array(15);
	this.arrTrailTimeIndices = [
		0, 1, 2, 3, 4, 
		5, 6, 7, 8, 9, 10,
		11, 12, 13, 14
	];

	this.delayTimer = 0;

	this.delay = 10;

	this.homingRate = 5;

	this.homingTargetPosition = new app.b2Vec2();

	this.minRadius = 10;
	this.maxRadius = 5;
	this.trailRadius = 6;

	this.arrPrevPositions = [];
	this.frameCacheTotal = 15;
	this.frameCacheIndex = 0;
	this.isFrameCacheMaxed = false;

	this.deg = 0;
	
	this.init();
};

goog.inherits(HomingProjectile, Projectile)

/**
*@override
*@public
*/
HomingProjectile.prototype.init = function() {
	this.shape = new createjs.Shape();
	this.shape.graphics
		.ss(2)
		.s(this.arrColors[0]).
		f(this.arrColors[0])
		.dc(0, 0, this.minRadius);
	
	for(var i = 0; i < this.arrTrails.length; i++) {
		this.arrTrails[i] = new createjs.Shape();
		this.arrTrails[i].graphics
			.ss(1)
			.s(Constants.DARK_BLUE)
			.f(Constants.BLUE)
			.dc(0, 0, this.trailRadius);

		this.arrTrails[i].alpha = 0;
	}

	for(var i = 0; i < this.frameCacheTotal; i++) {
		this.arrPrevPositions[i] = new app.b2Vec2();
	}

	this.setPhysics();

	Projectile.prototype.init.call(this);
};

/**
*@override
*@public
*/
HomingProjectile.prototype.update = function(options) {
	if(this.isAlive) {
		var //target = options.homingTarget,
			homingList = options.homingList,
			scale = app.physicsScale,
			rad,
			mainStage = app.layers.getStage(LayerTypes.MAIN),
			homingStage = app.layers.getStage(LayerTypes.HOMING),
			trigTable = app.trigTable,
			randRadius = Math.randomInRange(this.minRadius, this.maxRadius);

		//only do homing checks and dynamic drawing after delay
		if(++this.delayTimer > this.delay) {
			//determine homing target
			this.setHomingTarget(homingList);

			//swap stages when the projectile starts to home
			if(mainStage.getChildIndex(this.shape) > 0) {
				mainStage.removeChild(this.shape);
				homingStage.addChild(this.shape);
			}

			//only update homing velocity every so many frames
			if(createjs.Ticker.getTicks() % this.homingRate == 0) {
				rad = Math.atan2(
					this.homingTargetPosition.y - this.position.y, 
					this.homingTargetPosition.x - this.position.x
				),
				this.deg = Math.radToDeg(rad);

				this.velocity.x = trigTable.cos(this.deg) * this.velocityMod;
				this.velocity.y = trigTable.sin(this.deg) * this.velocityMod;
			}

			//draw head
			this.shape.graphics.clear();
			this.shape.graphics
				.ss(2)
				.s(Constants.BLUE)
				.f(this.arrColors[0])
				.dc(0, 0, randRadius);

			//draw tails
			this.drawTrails(homingStage, randRadius);
		}

		this.shape.x = this.position.x += this.velocity.x;
		this.shape.y = this.position.y += this.velocity.y;

		this.cachePrevPosition();

		this.physicalPosition.x = this.position.x / scale;
		this.physicalPosition.y = this.position.y / scale;
		this.body.SetPosition(this.physicalPosition);

		this.checkBounds();
	}
};

HomingProjectile.prototype.kill = function() {
	if(this.isAlive) {
		var i = -1,
			length = this.arrTrails.length,
			stage;

		this.setIsAlive(false);
		this.shape.getStage().removeChild(this.shape);

		while(++i < length) {
			stage = this.arrTrails[i].getStage()

			if(stage) {
				this.arrTrails[i].alpha = 0;
				stage.removeChild(this.arrTrails[i]);
			}
		}

		this.delayTimer = 0;
	}
};

/**
*@override
*@public
*/
HomingProjectile.prototype.checkBounds = function() {
	var pos = this.position,
		stage = app.layers.getStage(LayerTypes.MAIN),
		minX = -stage.x - Constants.CENTER_X,
		minY = -stage.y - Constants.CENTER_Y, 
		maxX = minX + (Constants.WIDTH * 2),
		maxY = minY + (Constants.HEIGHT * 2); 

	if((pos.x < minX || pos.x > maxX) || (pos.y < minY || pos.y > maxY)) {
		this.kill();
	}
};

HomingProjectile.prototype.setHomingTarget = function(homingList) {
	var homingLength = homingList.length,
		enemyPosition = null,
	    prevDistance = Number.MAX_VALUE,
	    distance = 0,
	    i = -1;

    //if there are enemies in the homing list, need to determine which is closest;
    //that becomes the homing target
    if(homingLength > 0) {
        while(++i < homingLength) {
            enemyPosition = homingList[i].position;

            //care only of magnitude, not actual value
            distance = this.position.DistanceSqrt(enemyPosition);

            //make target postion closer enemy position
            if(distance < prevDistance) {
                prevDistance = distance;
                this.homingTargetPosition = enemyPosition;
            }
        }
    } else {      
        //if homing projectiles are alive but there's no targets,
        //an artificial position is determined based on it's current movement angle
        this.homingTargetPosition.x = app.trigTable.cos(this.deg) * Number.MAX_VALUE;
        this.homingTargetPosition.y = app.trigTable.sin(this.deg) * Number.MAX_VALUE;
    }
};

/**
*@private
*Cache the base shape's previous positions for a determined amount of frames / time
*/
HomingProjectile.prototype.cachePrevPosition = function() {
	var prevPosition = this.arrPrevPositions[this.frameCacheIndex];

	prevPosition.x = this.position.x;
	prevPosition.y = this.position.y;

	//upon reaching the threshold, reset the index
	if(++this.frameCacheIndex >= this.frameCacheTotal) {
		this.frameCacheIndex = 0;

		//if all values of the cache have been initialized
		//all frame time indices can be implemented
		if(!this.isFrameCacheMaxed) {
			this.isFrameCacheMaxed = true;
		}
	}
};

/**
*@private
*/
HomingProjectile.prototype.drawTrails = function(stage, radius) {
	var i = -1,
		length = this.arrTrails.length,
		trail,
		prevPosition,
		radius;

	while(++i < length) {
		trail = this.arrTrails[i];

		//add the trail if not attached to stage
		//added to render "below" head or previous trail segment
		if(stage.getChildIndex(trail) < 0) {
			stage.addChildAt(trail, stage.getChildIndex(this.shape));
		}

		//Grab per the time index or if prevPosition Array has yet to reach desired capacity,
		//grab using the highest possible index
		if(this.isFrameCacheMaxed) {
			prevPosition = this.arrPrevPositions[this.arrTrailTimeIndices[i]];
		} else {
			prevPosition = this.arrPrevPositions[this.frameCacheIndex];
		}

		//the previous position has been resolved so the trail is set
		trail.x = prevPosition.x;
		trail.y = prevPosition.y;

		//gradually increase alpha; resets on kill
		trail.alpha += 0.01;
		if(trail.alpha > 0.75) {
			trail.alpha = 0.75;
		}
	}
};

/**
*@private
*/
HomingProjectile.prototype.setPhysics = function() {
	var fixDef = new app.b2FixtureDef(),
		bodyDef = new app.b2BodyDef();
	
	fixDef.density = 1.0;
	fixDef.friction = 0;
	fixDef.restitution = 1.0;
	fixDef.filter.categoryBits = this.categoryBits;
	fixDef.filter.maskBits = this.maskBits;
	fixDef.isSensor = true;
	fixDef.shape = new app.b2CircleShape(0.125);
	
	bodyDef.type = app.b2Body.b2_dynamicBody;
	this.body = app.physicsWorld.CreateBody(bodyDef);
	this.body.CreateFixture(fixDef);
	this.body.SetUserData(this);
	this.body.SetBullet(true);
	this.body.SetPosition(this.physicalPosition);
};


