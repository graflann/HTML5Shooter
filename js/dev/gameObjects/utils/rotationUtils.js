goog.provide('RotationUtils');

RotationUtils.updateShapeRotation = function(go) {
	var absAngleDif = 0;

	//art is natively offset by 90 deg compared to default createJS rotation value so an adjustment is made
	go.intendedRotation = go.baseRotationDeg + 90;

	//adjust intended for 
	if(go.intendedRotation >= 360) {
		go.intendedRotation -= 360;
	} else if(go.intendedRotation < 0) {
		go.intendedRotation += 360;
	}

	absAngleDif = Math.abs(go.intendedRotation - go.shape.rotation);

	//continuously update rotation 
	if(absAngleDif > go.rotationRate)
	{
		if(absAngleDif >= 180) {
			if(go.intendedRotation > go.shape.rotation) {
				RotationUtils.rotateShapeToAngle(go, -go.rotationRate);
			}
			else if(go.intendedRotation < go.shape.rotation) {
				RotationUtils.rotateShapeToAngle(go, go.rotationRate);
			}
		} else {
			if(go.intendedRotation > go.shape.rotation) {
				RotationUtils.rotateShapeToAngle(go, go.rotationRate);
			}
			else if(go.intendedRotation < go.shape.rotation) {
				RotationUtils.rotateShapeToAngle(go, -go.rotationRate);
			}
		}
	}
};

RotationUtils.rotateShapeToAngle = function(go, rotationRate) {
	if(rotationRate == 0) {
		return;
	}

	go.shape.rotation += rotationRate;

	if(go.shape.rotation <= 0) {
		go.shape.rotation += 360;
	}

	if(go.shape.rotation >= 360) {
		go.shape.rotation -= 360;
	}
};

RotationUtils.updateContainerRotation = function(go) {
	var absAngleDif = 0;

	//art is natively offset by 90 deg compared to default createJS rotation value so an adjustment is made
	go.intendedRotation = go.baseRotationDeg + 90;

	//adjust intended for 
	if(go.intendedRotation >= 360) {
		go.intendedRotation -= 360;
	} else if(go.intendedRotation < 0) {
		go.intendedRotation += 360;
	}

	absAngleDif = Math.abs(go.intendedRotation - go.container.rotation);

	//continuously update rotation 
	if(absAngleDif > go.rotationRate)
	{
		if(absAngleDif >= 180) {
			if(go.intendedRotation > go.container.rotation) {
				RotationUtils.rotateContainerToAngle(go, -go.rotationRate);
			}
			else if(go.intendedRotation < go.container.rotation) {
				RotationUtils.rotateContainerToAngle(go, go.rotationRate);
			}
		} else {
			if(go.intendedRotation > go.container.rotation) {
				RotationUtils.rotateContainerToAngle(go, go.rotationRate);
			}
			else if(go.intendedRotation < go.container.rotation) {
				RotationUtils.rotateContainerToAngle(go, -go.rotationRate);
			}
		}
	}
};

RotationUtils.rotateContainerToAngle = function(go, rotationRate) {
	if(rotationRate == 0) {
		return;
	}

	go.container.rotation += rotationRate;

	if(go.container.rotation <= 0) {
		go.container.rotation += 360;
	}

	if(go.container.rotation >= 360) {
		go.container.rotation -= 360;
	}
};