goog.provide('CollisionManager');

/**
*@enum {string}
*/
CollisionManager = function(arrParticleSystems, arrPlayerProjectileSystems) {
	this.arrParticleSystems = arrParticleSystems;

    this.arrPlayerProjectileSystems = arrPlayerProjectileSystems;

	/**
	*@type {Box2D.Dynamics.b2ContactListener}
	*/
	this.contactListener = null;

	this.killList = [];

	this.homingList = [];

    this.isHoming = false;

    this.homingTargetPosition = new app.b2Vec2();

	this.collisionOptions = {
		player: {
    		
    	},

    	enemy: {
    		explosions: this.arrParticleSystems[ParticleSystemNames.ENEMY_EXPLOSION],
            reticles: this.arrParticleSystems[ParticleSystemNames.PLAYER_RETICLE]
    	},

    	projectile: {
    		positiveHit: this.arrParticleSystems[ParticleSystemNames.POSITIVE_HIT],
    		neutralHit: this.arrParticleSystems[ParticleSystemNames.NEUTRAL_HIT]
    	},

    	sceneObject: {
    		
    	}
	};

	this.init();
};

CollisionManager.prototype.init = function() {
	var self = this;

	this.contactListener = new app.b2ContactListener();

    this.contactListener.BeginContact = function(contact) {
        self.beginContact(contact);
    };
	
    this.contactListener.EndContact = function(contact) {
        self.endContact(contact);
    };
	
    this.contactListener.PostSolve = function(contact, impulse) {
       	self.postSolve(contact, impulse);
    };
	
    this.contactListener.PreSolve = function(contact, oldManifold) {
    	self.preSolve(contact, oldManifold);
    };

	app.physicsWorld.SetContactListener(this.contactListener);
};

CollisionManager.prototype.update = function(options) {
    this.updateHoming(options);
    this.updateKills();
};

CollisionManager.prototype.clear = function() {

};

CollisionManager.prototype.resetHomingList = function() {
    this.homingList.length = 0;
};

CollisionManager.prototype.updateHoming = function(options) {
    //Initial check ensures homing projectiles are in play
    if(options.player.homingProjectileSystem.getIsAlive()) {
        var player = options.player,
            killLength = this.killList.length,
            homingLength = this.homingList.length,
            i = -1,
            j = -1,
            enemyPosition,
            prevDistance = Number.MAX_VALUE,
            distance = 0;

        //TODO: compare killList elements against homingList and 
        //remove matches from homingList, because they're dead...
        while(++i < homingLength) {
            j = -1;

            while(++j < killLength) {
                if(this.homingList[i] === this.killList[j]){
                    //remove from the homing list as enemy is set to die
                    this.homingList.splice(i, 1);
                    i--;
                }
            }
        }

        //reset homing length
        homingLength = this.homingList.length

        //if there are enemies in the homing list, need to determine which is closest;
        //that becomes the homing target
        if(homingLength > 0) {
            i = -1;
            while(++i < homingLength) {
                enemyPosition = this.homingList[i].position;

                //care only of distance magnitude, not actual value
                distance = player.position.DistanceSqrt(enemyPosition);

                if(distance < prevDistance) {
                    prevDistance = distance;
                    this.homingTargetPosition = enemyPosition;
                }
            }
        } else {      
            //if homing projectiles are alive but there's no targets,
            //an artificial position is determined
            this.homingTargetPosition.x = player.position.x;
            this.homingTargetPosition.y = -Number.MAX_VALUE;
        }
    }
};

CollisionManager.prototype.updateKills = function() {
    var i = 0;

    //"kill" everything that qualified for removal
    for(i = 0; i < this.killList.length; i++) {
        this.killList[i].kill();
    }

    //reset the list
    this.killList.length = 0;
};

CollisionManager.prototype.beginContact = function(contact) {
	var dataA = contact.GetFixtureA().GetBody().GetUserData(),
    	dataB = contact.GetFixtureB().GetBody().GetUserData();

    //PLAYER VS
    //PLAYER PROJECTILE VS ENEMY/////////////////////////////////////////////
    if(dataA instanceof Projectile) {
    	this.playerProjectileVsEnemy(dataA, dataB);
    	return;
    } else if(dataB instanceof Projectile) {
    	this.playerProjectileVsEnemy(dataB, dataA);
    	return;
    }
    //////////////////////////////////////////////////////////////////
    
    //HOMING TARGETING OVERLAY (HTO) VS ENEMY/////////////////////////
    if(dataA instanceof HomingTargetingOverlay) {
    	this.htoVsEnemy(dataA, dataB);
    	return;
    } else if(dataB instanceof HomingTargetingOverlay) {
    	this.htoVsEnemy(dataB, dataA);
    	return;
    }
    //////////////////////////////////////////////////////////////////
    
    //PLAYER TANK VS ENEMY BODY or SCENEOBJECT/////////////////////////
    if(dataA instanceof PlayerTank) {
        this.playerTankVsObjects(dataA, dataB);
        return;
    } else if(dataB instanceof PlayerTank) {
        this.playerTankVsObjects(dataB, dataA);
        return;
    }
    //////////////////////////////////////////////////////////////////
    //
};

CollisionManager.prototype.endContact = function(contact) {

};

CollisionManager.prototype.postSolve = function(contact, impulse) {

};

CollisionManager.prototype.preSolve = function(contact, oldManifold) {

};

CollisionManager.prototype.playerProjectileVsEnemy = function(dataA, dataB) {
    //console.log(dataA);
    //console.log(dataB);

	//PROCESS ENEMY
	if(dataB instanceof Enemy) {
		dataB.onCollide(dataA, this.collisionOptions.enemy);

        //TODO: Some processing on a enemy health variable to determine "death"
        //then push onto the kill list
		this.killList.push(dataB);
	}

	//PROCESS PROJECTILE
	dataA.onCollide(dataB, this.collisionOptions.projectile);

	//certain projectile types go "through" objects during collision,
	//so opt out of the remaining function code or execute
	if(dataA instanceof SniperProjectile || dataA instanceof BladeProjectile) {
		//console.log("Sniper");
		return;
	}

	this.killList.push(dataA);
};

CollisionManager.prototype.htoVsEnemy = function(dataA, dataB) {
	//console.log(dataA);
    //console.log(dataB);

    var homingLength = this.homingList.length,
        i = -1;

    if(homingLength < this.arrPlayerProjectileSystems[ProjectileTypes.HOMING].length()) {
        //add homing reticle
        dataB.onHoming(dataA, this.collisionOptions.enemy);

        //PROCESS ENEMY
        //exits if enemy is already in homing list
        while(++i < homingLength) {
            if(this.homingList[i] == dataB) {
                return;
            }
        }

        //push onto the homing list if not already present
        this.homingList.push(dataB);
    }
};

CollisionManager.prototype.playerTankVsObjects = function(dataA, dataB) {
    //console.log(dataA);
    //console.log(dataB);

    if(dataB instanceof SceneObject) {
        console.log("Hitting so");

        //dataA.setPosition(dataA.prevPosition.x, dataA.prevPosition.y);
    } else {
        console.log("Hitting enemy");
    }
};

goog.exportSymbol('CollisionManager', CollisionManager);