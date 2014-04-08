goog.provide('CollisionManager');

goog.require('ItemTypes');

/**
*@constructor
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

    /**
    *@type {Array}
    *Caches system emissions invoking collision bodies, emitting them during update
    *and not in the midst of collision checking
    */
    this.activationList = [];

	this.killList = [];

	this.homingList = [];

    this.isHoming = false;

	this.collisionOptions = {
		player: {
    		explosions:         this.arrParticleSystems[ParticleSystemNames.PLAYER_EXPLOSION]
    	},

    	enemy: {
    		explosions:         this.arrParticleSystems[ParticleSystemNames.ENEMY_EXPLOSION],
            reticles:           this.arrParticleSystems[ParticleSystemNames.PLAYER_RETICLE]
    	},

    	projectile: {
    		positiveHit:      this.arrParticleSystems[ParticleSystemNames.POSITIVE_HIT],
            neutralHit:       this.arrParticleSystems[ParticleSystemNames.NEUTRAL_HIT],
    		grenade:          this.arrParticleSystems[ParticleSystemNames.GRENADE],
            activationList:   this.activationList
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
    this.arrParticleSystems = null;

    this.arrPlayerProjectileSystems = null;

    this.arrItemSystems = null;

    //TODO: Additional contactListener disposal?
    this.contactListener = null;

    this.activationList = null;

    this.killList = null;

    this.homingList = null;

    this.collisionOptions = null;
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
            homingEntity = null,
            i = -1,
            j = -1;

        //Compares killList elements against homingList and 
        //remove matches from homingList, because they're dead...
        while(++i < homingLength) {
            j = -1;

            homingEntity = this.homingList[i];

            while(++j < killLength) {
                //ensure the homingList element references an Enemy instance and is on the killList
                if(homingEntity == this.killList[j]) {
                    //remove enemy from the homing list if it is set to die
                    this.homingList.splice(i, 1);
                    i--;
                }
            }
        }
    }
};

CollisionManager.prototype.updateKills = function() {
    var i = -1;

    //"kills" everything that qualified for removal during collision step
    while(++i < this.killList.length) {
        this.killList[i].kill();
    }

    //reset the list
    this.killList.length = 0;
};

CollisionManager.prototype.updateActivation = function() {
    var i = -1,
        obj;

    //activate items caused by collision
    while (++i < this.activationList.length) {
        obj = this.activationList[i];

        obj.system.emit(obj.qty, obj);
    }

    //reset the list
    this.activationList.length = 0;
};

CollisionManager.prototype.beginContact = function(contact) {
	var bodyA = contact.GetFixtureA().GetBody(),
        bodyB = contact.GetFixtureB().GetBody(),
        dataA = bodyA.GetUserData(),
    	dataB = bodyB.GetUserData();

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
CollisionManager.prototype.projectileVsObject = function(projectile, object, objectBody) {
    //PROCESS PROJECTILE
    projectile.onCollide(object, this.collisionOptions.projectile);

	//VS. ENEMY
	if(object instanceof Enemy || object instanceof RotorEngine) {
        object.onCollide(projectile, this.collisionOptions.enemy);

        //TODO: Some processing on a enemy health variable to determine "death"
        //then push onto the kill list
        if(object.health <= 0) {
            this.killList.push(object);
            this.activationList.push(
                {
                    system: this.arrItemSystems[ItemTypes.OVERDRIVE],
                    qty: 1,
                    posX: object.container.x, 
                    posY: object.container.y,
                    velX: 64,
                    velY: 64,
                    isRotated: true
                }
            );

            app.assetsProxy.playSound("impact1", 0.5);
        }

        //certain projectile types go "through" objects during collision,
        //so opt out of the remaining function code or execute
        if(projectile instanceof SniperProjectile || 
            projectile instanceof BladeProjectile ||
            projectile instanceof LaserProjectile ||
            projectile instanceof RotarySawProjectile
        ) {
            return;
        }
    //VS. SCENE OBJECT
	} else if (object instanceof SceneObject) {
        //certain projectile types go "through" or "bounce off" of objects during collision,
        //so opt out of the remaining function code or execute
        if(projectile instanceof SniperProjectile || 
            projectile instanceof BladeProjectile ||
            projectile instanceof ReflectProjectile || //"bounces" off of SceneObjects but not Enemy instances
            projectile instanceof LaserProjectile ||
            projectile instanceof RotarySawProjectile
        ) {
            return;
        }
    //VS. PLAYER - invincible during boost
    } else if (object instanceof PlayerTank && !object.isBoosting) { 
        // object.onCollide(projectile, this.collisionOptions.player);

        // this.killList.push(object);

        // app.assetsProxy.playSound("impact1", 0.5);
    }

    //set projectile up for removal during update
	this.killList.push(projectile);
};

CollisionManager.prototype.htoVsEnemy = function(hto, enemy) {
    var homingLength = this.homingList.length,
        i = -1;

    if(homingLength < this.arrPlayerProjectileSystems[ProjectileTypes.HOMING].length()) {
        //PROCESS ENEMY

        while(++i < homingLength) {
            if(this.homingList[i] === enemy) {
                return;
            }
        }

        //add homing reticle
        enemy.onHoming(hto, this.collisionOptions.enemy);

        //push onto the homing list if not already present
        this.homingList.push(enemy);

        app.assetsProxy.playSound("menuFX2", 0.5);
    }
};

CollisionManager.prototype.playerVsObject = function(player, object) {
    if(object instanceof Enemy) {
        object.onCollide(player, this.collisionOptions.enemy);

        //then push onto the kill list
        if(object.health <= 0) {
            this.killList.push(object);
            this.activationList.push(
                {
                    system: this.arrItemSystems[ItemTypes.OVERDRIVE],
                    qty: 1,
                    posX: object.container.x, 
                    posY: object.container.y,
                    velX: 64,
                    velY: 64,
                    isRotated: true
                }
            );
        }

        app.assetsProxy.playSound("impact1", 0.5);
        return;
    }

    if(object instanceof EnergyItem) {
        player.energy += object.value;

        player.changeEnergy(player.energy);

        this.killList.push(object);
        return;
    }

    if(object instanceof OverdriveItem) {
        player.overdrive += object.value;

        player.changeOverdrive(player.overdrive);

        this.arrParticleSystems[ParticleSystemNames.OVERDRIVE_PICK_UP].emit(1, {
            posX: player.position.x,
            posY: player.position.y
        });

        // this.arrParticleSystems[ParticleSystemNames.SPAWN_GENERATOR].emit(1, {
        //     posX: player.position.x,
        //     posY: player.position.y
        // });

        this.killList.push(object);

        app.assetsProxy.playSound("menuFX1", 0.5);

        app.scoreManager.updateBonusMultiplier(0.1);
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