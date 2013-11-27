goog.provide('CollisionManager');

goog.require('ItemTypes');

/**
*@enum {string}
*/
CollisionManager = function(
    arrParticleSystems, 
    arrPlayerProjectileSystems,
    arrItemSystems
) {
	this.arrParticleSystems = arrParticleSystems;

    this.arrPlayerProjectileSystems = arrPlayerProjectileSystems;

    this.arrItemSystems = arrItemSystems;

	/**
	*@type {Box2D.Dynamics.b2ContactListener}
	*/
	this.contactListener = null;

    this.activationList = [];

	this.killList = [];

	this.homingList = [];

    this.isHoming = false;

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
    this.updateHomingList(options);
    this.updateKills();
    this.updateActivation();
};

CollisionManager.prototype.clear = function() {

};

CollisionManager.prototype.resetHomingList = function() {
    this.homingList.length = 0;
};

CollisionManager.prototype.updateHomingList = function(options) {
    //Initial check ensures homing projectiles are in play
    if(options.player.homingProjectileSystem.getIsAlive()) {
        var player = options.player,
            homingLength = this.homingList.length,
            killLength = this.killList.length,
            i = -1,
            j = -1;

        //TODO: compare killList elements against homingList and 
        //remove matches from homingList, because they're dead...
        while(++i < homingLength) {
            j = -1;

            while(++j < killLength) {
                if(this.homingList[i] === this.killList[j]) {
                    //remove enemy from the homing list it is set to die
                    this.homingList.splice(i, 1);
                    i--;
                }
            }
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

CollisionManager.prototype.updateActivation = function() {
    var i = 0;

    //activate items caused by collision
    for(i = 0; i < this.activationList.length; i++) {
        
        if(this.activationList[i] !== undefined || this.activationList[i] !== null) {
            this.arrItemSystems[ItemTypes.ENERGY].emit(
                1, 
                this.activationList[i]
            );
        }
    }

    //reset the list
    this.activationList.length = 0;
};

CollisionManager.prototype.beginContact = function(contact) {
	var dataA = contact.GetFixtureA().GetBody().GetUserData(),
    	dataB = contact.GetFixtureB().GetBody().GetUserData();

    //PROJECTILE VS OBJECT////////////////////////////////////////////
    if(dataA instanceof Projectile) {
    	this.projectileVsObject(dataA, dataB);
    	return;
    } else if(dataB instanceof Projectile) {
    	this.projectileVsObject(dataB, dataA);
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
    
    //PLAYER VS ENEMY BODY, SCENEOBJECT, or ITEM//////////////////////
    if(dataA instanceof PlayerTank) {
        this.playerVsObject(dataA, dataB);
        return;
    } else if(dataB instanceof PlayerTank) {
        this.playerVsObject(dataB, dataA);
        return;
    }
    //////////////////////////////////////////////////////////////////
    
    //ENEMY VS SCENEOBJECT////////////////////////////////////////////
    if(dataA instanceof Enemy) {
        this.enemyVsObject(dataA, dataB);
        return;
    } else if(dataB instanceof Enemy) {
        this.enemyVsObject(dataB, dataA);
        return;
    }
    //////////////////////////////////////////////////////////////////

    //ITEM VS SCENEOBJECT////////////////////////////////////////////
    if(dataA instanceof Item) {
        this.itemVsObject(dataA, dataB);
        return;
    } else if(dataB instanceof Item) {
        this.itemVsObject(dataB, dataA);
        return;
    }
    //////////////////////////////////////////////////////////////////
};

CollisionManager.prototype.endContact = function(contact) {

};

CollisionManager.prototype.postSolve = function(contact, impulse) {

};

CollisionManager.prototype.preSolve = function(contact, oldManifold) {

};

//VERSUS/////////////////////////////////////////////////////////////////////
CollisionManager.prototype.projectileVsObject = function(projectile, object) {
    //console.log(projectile);
    //console.log(object);

	//PROCESS ENEMY
	if(object instanceof Enemy) {
		object.onCollide(projectile, this.collisionOptions.enemy);

        //TODO: Some processing on a enemy health variable to determine "death"
        //then push onto the kill list
        if(object.health <= 0) {
            this.killList.push(object);
            this.activationList.push(
                {
                    posX: object.container.x, 
                    posY: object.container.y,
                    velX: 64,
                    velY: 64,
                    isRotated: true
                }
            );
        }
	}
    //TODO: process collision w player

	//PROCESS PROJECTILE
	projectile.onCollide(object, this.collisionOptions.projectile);

	//certain projectile types go "through" objects during collision,
	//so opt out of the remaining function code or execute
	if(projectile instanceof SniperProjectile || projectile instanceof BladeProjectile) {
		//console.log("Sniper");
		return;
	}

	this.killList.push(projectile);
};

CollisionManager.prototype.htoVsEnemy = function(hto, enemy) {
    //console.log(hto);
    //console.log(enemy);

    var homingLength = this.homingList.length,
        i = -1;

    if(homingLength < this.arrPlayerProjectileSystems[ProjectileTypes.HOMING].length()) {
        //add homing reticle
        enemy.onHoming(hto, this.collisionOptions.enemy);

        //PROCESS ENEMY
        //exits if enemy is already in homing list
        while(++i < homingLength) {
            if(this.homingList[i] == enemy) {
                return;
            }
        }

        //push onto the homing list if not already present
        this.homingList.push(enemy);
    }
};

CollisionManager.prototype.playerVsObject = function(player, object) {
    if(object instanceof Enemy) {
        object.onCollide(player, this.collisionOptions.enemy);
        return;
    }

    if(object instanceof Item) {
        player.energy += object.value;

        player.changeEnergy(player.energy);

        this.killList.push(object);
        return;
    }

    //SceneObject (Projectile would be resolved prior to this)
    if(object instanceof SceneObject) {
        if(player.isBoosting) {
            player.forceBoostExit();
        }
    }
};

CollisionManager.prototype.enemyVsObject = function(enemy, object) {
    enemy.onCollide(object, this.collisionOptions.enemy);
};

CollisionManager.prototype.itemVsObject = function(item, object) {
    console.log("Item colliding");
};
/////////////////////////////////////////////////////////////////////////////

goog.exportSymbol('CollisionManager', CollisionManager);