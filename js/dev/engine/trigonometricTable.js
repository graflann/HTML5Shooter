goog.provide('TrigonometricTable');

/**
*@constructor
*/
TrigonometricTable = function() {
	var i = -1;

	this.arrTable = [];

	while(i++ < 360){
		rad = Math.degToRad(i);

		this.arrTable[i] = {
			sin: Math.sin(rad), 
			cos: Math.cos(rad)
		};
	}
};

/**
*@private
*/
TrigonometricTable.instance = null;

/**
*@ return {TrigonometricTable}
*/
TrigonometricTable.getInstance = function() {
    if(TrigonometricTable.instance === null) {
        TrigonometricTable.instance = new TrigonometricTable();
    }

    return TrigonometricTable.instance;
};

/**
*@public
*@ return {Number}
*/
TrigonometricTable.prototype.sin = function(deg) {
	return this.arrTable[this.normalizeDegrees(deg)].sin;
};

/**
*@public
*@ return {Number}
*/
TrigonometricTable.prototype.cos = function(deg) {
	return this.arrTable[this.normalizeDegrees(deg)].cos;
};

/**
*@public
*@ return {Number}
*/
TrigonometricTable.prototype.normalizeDegrees = function(deg) {
	deg = Math.round(deg % 360);

	if(deg < 0) {
		deg += 360;
	}

	return deg;
};

goog.exportSymbol('TrigonometricTable', TrigonometricTable);