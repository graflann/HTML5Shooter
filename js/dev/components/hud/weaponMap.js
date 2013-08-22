goog.provide('WeaponMap');

goog.require('WeaponTypes');
goog.require('ProjectileTypes');
goog.require('TurretTypes');

/**
*@enum {String}
*Maps numeric indices to WeaponType, ProjectileType, and TurretType keys
*/
WeaponMap = [
    { 
    	weaponType: WeaponTypes.VULCAN,
    	projectileType: ProjectileTypes.VULCAN,
    	turretType: TurretTypes.VULCAN
    },
    { 
    	weaponType: WeaponTypes.SPREAD,
    	projectileType: ProjectileTypes.SPREAD,
    	turretType: TurretTypes.SPREAD
    },
    { 
    	weaponType: WeaponTypes.BLADE,
    	projectileType: ProjectileTypes.BLADE,
    	turretType: TurretTypes.BLADE
    },
    { 
    	weaponType: WeaponTypes.RAIL,
    	projectileType: ProjectileTypes.SNIPER,
    	turretType: TurretTypes.SNIPER
    }
];

goog.exportSymbol('WeaponMap', WeaponMap);
