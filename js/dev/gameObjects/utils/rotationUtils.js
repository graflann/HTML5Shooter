goog.provide('RotationUtils');

RotationUtils.updateRotation = function(go, displayObject, offset) {
	var absAngleDif = 0,
		offset = offset || 0;

	//art is sometimes natively offset by deg compared to default createJS rotation value so an adjustment is made
	go.intendedRotation = go.baseRotationDeg + offset;

	//adjust intended for 
	if(go.intendedRotation >= 360) {
		go.intendedRotation -= 360;
	} else if(go.intendedRotation < 0) {
		go.intendedRotation += 360;
	}

	absAngleDif = Math.abs(go.intendedRotation - displayObject.rotation);

	//continuously update rotation 
	if(absAngleDif > go.rotationRate)
	{
		if(absAngleDif >= 180) {
			if(go.intendedRotation > displayObject.rotation) {
				RotationUtils.rotateToAngle(displayObject, -go.rotationRate);
			}
			else if(go.intendedRotation < displayObject.rotation) {
				RotationUtils.rotateToAngle(displayObject, go.rotationRate);
			}
		} else {
			if(go.intendedRotation > displayObject.rotation) {
				RotationUtils.rotateToAngle(displayObject, go.rotationRate);
			}
			else if(go.intendedRotation < displayObject.rotation) {
				RotationUtils.rotateToAngle(displayObject, -go.rotationRate);
			}
		}
	}
};

RotationUtils.rotateToAngle = function(displayObject, rotationRate) {
	if(rotationRate == 0) {
		return;
	}

	displayObject.rotation += rotationRate;

	if(displayObject.rotation < 0) {
		displayObject.rotation += 360;
	} else if(displayObject.rotation >= 360) {
		displayObject.rotation -= 360;
	}
};