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
    var i = -1,
        objectToKill;

    //"kills" everything that qualified for removal during collision step
    while(++i < this.killList.length) {
        objectToKill = this.killList[i];

        //scores killed enemies with point value X bonus multiplier
        //Note: EnemyCentipede handles scoring internally on kill
        if(objectToKill.getScoreValue) {
            app.scoreManager.updateScore(objectToKill.getScoreValue());
        }

        objectToKill.kill();
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
    	dataB = bodyB.GetUserData(),
        router = CollisionManager.ROUTER,
        key = [dataA.getCollisionRoutingObject().type, dataB.getCollisionRoutingObject().type].join("");

    //uses composite key to route to a "versus" method that handles the result of the collision
    this[router[key]](dataA, dataB);
};

CollisionManager.prototype.endContact = function(contact) {

};

CollisionManager.prototype.postSolve = function(contact, impulse) {

};

CollisionManager.prototype.preSolve = function(contact, oldManifold) {

};

CollisionManager.ROUTER = {
    ////////////////////////////////////////////////////
    projectileenemyCentipede:   "projectileVsEnemy",
    enemyCentipedeprojectile:   "enemyVsProjectile",

    projectileenemyCopter:      "projectileVsEnemy",
    enemyCopterprojectile:      "enemyVsProjectile",

    projectileenemyTank:        "projectileVsEnemy",
    enemyTankprojectile:        "enemyVsProjectile",

    projectileenemyRanger:      "projectileVsEnemy",
    enemyRangerprojectile:      "enemyVsProjectile",

    projectileenemyFencer:      "projectileVsEnemy",
    enemyFencerprojectile:      "enemyVsProjectile",

    projectileenemyTurret:      "projectileVsEnemy",
    enemyTurretprojectile:      "enemyVsProjectile",

    projectilerotorEngine:      "projectileVsEnemy",
    rotorEngineprojectile:      "enemyVsProjectile",
    ////////////////////////////////////////////////////

    ////////////////////////////////////////////////////
    projectileshield:           "projectileVsShield",
    shieldprojectile:           "shieldVsProjectile",
    ////////////////////////////////////////////////////

    ////////////////////////////////////////////////////
    projectileplayer:           "projectileVsPlayer",
    playerprojectile:           "playerVsProjectile",
    ////////////////////////////////////////////////////

    ////////////////////////////////////////////////////
    projectilesceneObject:      "projectileVsSceneObject",
    sceneObjectprojectile:      "sceneObjectVsProjectile",
    ////////////////////////////////////////////////////

    ////////////////////////////////////////////////////
    htoenemyCopter:             "htoVsEnemy",
    enemyCopterhto:             "enemyVsHto",

    htorotorEngine:             "htoVsEnemy",
    rotorEnginehto:             "enemyVsHto",

    htoenemyTurret:             "htoVsEnemy",
    enemyTurrethto:             "enemyVsHto",
    ////////////////////////////////////////////////////

    ////////////////////////////////////////////////////
    playerenemyTank:            "playerVsEnemy",
    enemyTankPlayer:            "enemyVsPlayer",

    playerenemyCentipede:       "playerVsEnemy",
    enemyCentipedePlayer:       "enemyVsPlayer",
    ////////////////////////////////////////////////////

    ////////////////////////////////////////////////////
    playerenemyRanger:          "playerVsEnemyTrooper",
    enemyRangerPlayer:          "enemyTrooperVsPlayer",

    playerenemyFencer:          "playerVsEnemyTrooper",
    enemyFencerPlayer:          "enemyTrooperVsPlayer",
    ////////////////////////////////////////////////////

    ////////////////////////////////////////////////////
    playersceneObject:          "playerVsSceneObject",
    sceneObjectplayer:          "sceneObjectVsPlayer",
    ////////////////////////////////////////////////////

    ////////////////////////////////////////////////////
    playeroverdrive:            "playerVsOverdrive",
    overdriveplayer:            "overdriveVsPlayer",
    ////////////////////////////////////////////////////

    ////////////////////////////////////////////////////
    playerhealth:               "playerVsHealth",
    healthplayer:               "healthVsPlayer",
    ////////////////////////////////////////////////////

    ////////////////////////////////////////////////////
    enemyCentipedesceneObject:  "enemyVsSceneObject",
    sceneObjectenemyCentipede:  "sceneObjectVsEnemy",
    ////////////////////////////////////////////////////

    ////////////////////////////////////////////////////
    overdrivesceneObject:       "itemVsSceneObject",
    sceneObjectoverdrive:       "sceneObjectVsItem",
    ////////////////////////////////////////////////////

    ////////////////////////////////////////////////////
    healthsceneObject:          "itemVsSceneObject",
    sceneObjecthealth:          "sceneObjectVsItem",
    ////////////////////////////////////////////////////

    ////////////////////////////////////////////////////
    parryprojectile:            "parryVsProjectile",
    projectileparry:            "projectileVsParry"
    ////////////////////////////////////////////////////
};

//ROUTER MAPPING TO VERSUS///////////////////////////////////////////////////

//projectileVsEnemy/enemyVsProjectile////////////////////////////////////////
CollisionManager.prototype.projectileVsEnemy = function(projectile, enemy) {
    //PROCESS PROJECTILE
    projectile.onCollide(enemy, this.collisionOptions.projectile);

    enemy.onCollide(projectile, this.collisionOptions.enemy);

    if(enemy.health <= 0) {

        this.killList.push(enemy);
        this.activationList.push(
            {
                system: this.arrItemSystems[ItemTypes.OVERDRIVE],
                qty: 1,
                posX: enemy.container.x, 
                posY: enemy.container.y,
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

    //set projectile up for removal during update
    this.killList.push(projectile);
};

CollisionManager.prototype.enemyVsProjectile = function(enemy, projectile) {
    this.projectileVsEnemy(projectile, enemy);
};
/////////////////////////////////////////////////////////////////////

//projectileVsSceneObject/sceneObjectVsProjectile////////////////////////////////////////
CollisionManager.prototype.projectileVsShield = function(projectile, shield) {
    //PROCESS PROJECTILE
    projectile.onCollide(shield, this.collisionOptions.projectile);

    //set projectile up for removal during update
    this.killList.push(projectile);
};

CollisionManager.prototype.shieldVsProjectile = function(shield, projectile) {
    this.projectileVsSceneObject(projectile, shield);
};
/////////////////////////////////////////////////////////////////////

//projectileVsPlayer/playerVsProjectile////////////////////////////////////////
CollisionManager.prototype.projectileVsPlayer = function(projectile, player) {
    //PROCESS PROJECTILE
    projectile.onCollide(player, this.collisionOptions.projectile);

    if(!player.isBoosting) {
        player.onCollide(projectile, this.collisionOptions.player);

        if(player.getHealth() == 0) {
            this.killList.push(player);
            app.assetsProxy.playSound("explosion1");
        }
    }

    //set projectile up for removal during update
    this.killList.push(projectile);
};

CollisionManager.prototype.playerVsProjectile = function(player, projectile) {
    this.projectileVsPlayer(projectile, player);
};
/////////////////////////////////////////////////////////////////////


//playerVsEnemy/enemyVsPlayer////////////////////////////////////////
CollisionManager.prototype.playerVsEnemy = function(player, enemy) {
    //player boost kills any ground enemy on contact
    if(player.isBoosting) {
        this.playerVsEnemyTrooper(player, enemy);
    } else {
        player.onCollide(enemy, this.collisionOptions.player);

        if(player.getHealth() == 0) {
            this.killList.push(player);
            app.assetsProxy.playSound("explosion1");
        }
    }
};

CollisionManager.prototype.enemyVsPlayer = function(enemy, player) {
    this.playerVsEnemy(player, enemy);
};
/////////////////////////////////////////////////////////////////////


//playerVsEnemyTrooper/enemyTrooperVsPlayer////////////////////////////////////////
CollisionManager.prototype.playerVsEnemyTrooper = function(player, enemy) {
    this.killList.push(enemy);

    this.activationList.push(
        {
            system: this.arrItemSystems[ItemTypes.OVERDRIVE],
            qty: 1,
            posX: enemy.container.x, 
            posY: enemy.container.y,
            velX: 64,
            velY: 64,
            isRotated: true
        }
    );

    app.assetsProxy.playSound("impact1", 0.5);

    enemy.onCollide(player, this.collisionOptions.enemy);
};

CollisionManager.prototype.enemyTrooperVsPlayer = function(enemy, player) {
    this.playerVsEnemy(player, enemy);
};
/////////////////////////////////////////////////////////////////////


//projectileVsSceneObject/sceneObjectVsProjectile////////////////////////////////////////
CollisionManager.prototype.projectileVsSceneObject = function(projectile, sceneObject) {
    //PROCESS PROJECTILE
    projectile.onCollide(sceneObject, this.collisionOptions.projectile);

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

    //set projectile up for removal during update
    this.killList.push(projectile);
};

CollisionManager.prototype.sceneObjectVsProjectile = function(sceneObject, projectile) {
    this.projectileVsSceneObject(projectile, sceneObject);
};
/////////////////////////////////////////////////////////////////////


//htoVsEnemy/enemyVsHto////////////////////////////////////////
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

CollisionManager.prototype.enemyVsHto = function(enemy, hto) {
    this.htoVsEnemy(hto, enemy);
};
/////////////////////////////////////////////////////////////////////


//playerVsSceneObject/sceneObjectVsPlayer////////////////////////////////////////
CollisionManager.prototype.playerVsSceneObject = function(player, sceneObject) {
    if(player.isBoosting) {
        player.forceBoostExit();
    }
};

CollisionManager.prototype.sceneObjectVsPlayer = function(sceneObject, player) {
    this.projectileVsPlayerTank(player, sceneObject);
};
/////////////////////////////////////////////////////////////////////


//playerVsOverdrive/overdriveVsPlayer////////////////////////////////////////
CollisionManager.prototype.playerVsOverdrive = function(player, overdriveItem) {
    player.overdrive += overdriveItem.value;

    player.changeOverdrive(player.overdrive);

    this.arrParticleSystems[ParticleSystemNames.OVERDRIVE_PICK_UP].emit(1, {
        posX: player.position.x,
        posY: player.position.y
    });

    this.killList.push(overdriveItem);

    app.assetsProxy.playSound("menuFX1", 0.5);

    app.scoreManager.updateBonusMultiplier(0.1);
};

CollisionManager.prototype.overdriveVsPlayer = function(overdriveItem, player) {
    this.playerVsOverdrive(player, overdriveItem);
};
/////////////////////////////////////////////////////////////////////

//playerVsHealth/healthVsPlayer////////////////////////////////////////
CollisionManager.prototype.playerVsHealth = function(player, healthItem) {
    player.modifyHealth(healthItem.value);

    this.arrParticleSystems[ParticleSystemNames.HEALTH_PICK_UP].emit(1, {
        posX: player.position.x,
        posY: player.position.y
    });

    this.killList.push(healthItem);

    // app.assetsProxy.playSound("menuFX1", 0.5);
};

CollisionManager.prototype.healthVsPlayer = function(healthItem, player) {
    this.playerVsHealth(player, healthItem);
};
/////////////////////////////////////////////////////////////////////


//enemyVsSceneObject/sceneObjectVsEnemy////////////////////////////////////////
CollisionManager.prototype.enemyVsSceneObject = function(enemy, sceneObject) {
    enemy.onCollide(sceneObject, this.collisionOptions.enemy);
};

CollisionManager.prototype.sceneObjectVsEnemy = function(sceneObject, enemy) {
    this.enemyVsSceneObject(enemy, sceneObject);
};
/////////////////////////////////////////////////////////////////////////////


//itemVsSceneObject/sceneObjectVsItem////////////////////////////////////////
CollisionManager.prototype.itemVsSceneObject = function(item, sceneObject) {
    
};

CollisionManager.prototype.sceneObjectVsItem = function(sceneObject, item) {
    this.itemVsSceneObject(item, sceneObject);
};
/////////////////////////////////////////////////////////////////////////////

//parryVsProjectile/projectileVsParry////////////////////////////////////////
CollisionManager.prototype.parryVsProjectile = function(parry, projectile) {
    projectile.onCollide(parry, this.collisionOptions.projectile);

    this.activationList.push(
        {
            system: this.arrItemSystems[ItemTypes.HEALTH],
            qty: 1,
            posX: projectile.shape.x, 
            posY: projectile.shape.y,
            velX: 64,
            velY: 64,
            isRotated: true
        }
    );

    this.killList.push(projectile);
};

CollisionManager.prototype.projectileVsParry = function(projectile, parry) {
    this.parryVsProjectile(parry, projectile);
};
/////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////

goog.exportSymbol('CollisionManager', CollisionManager);