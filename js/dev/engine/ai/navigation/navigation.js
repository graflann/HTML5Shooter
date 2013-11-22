goog.provide('Navigation');

/**
* The navigation object employed by a game object (e.g. enemy)
*@constructor
*/
Navigation = function() {
	this.arrNodePositions = null;

	this.positionIndex = 0;

	this.targetPosition = new app.b2Vec2();

	this.init();
};

Navigation.prototype.init = function() {
	this.arrNodePositions = [];
};

/**
* Performs a search for a target position or updates the target position
*/
Navigation.prototype.update = function(sourcePos, targetPos) {
	if(this.arrNodePositions[this.positionIndex] === null || 
		this.arrNodePositions[this.positionIndex] === undefined)
	{
		var path = app.pathFinder.findPathByPosition(sourcePos, targetPos);

		this.arrNodePositions.length = 0;

		//disregard the positon at index 0 since entity should already be near that referenced node
		for(i = 1; i < path.length; i++) {
	        this.arrNodePositions.push(app.pathFinder.getNodePosition(path[i]));
	    }

	    //we can assume we postionally close enough to source index / position
	    //to make the target position the next index
	    this.positionIndex = 0;
		
		if(this.arrNodePositions[this.positionIndex] !== undefined) {
			this.targetPosition = this.arrNodePositions[this.positionIndex];
		}

		//console.log("Creating path: " + this.arrNodePositions.length.toString());
	}
	else
	{
		var distance = sourcePos.DistanceSqrd(this.targetPosition);

		//close enough to target position to move on to the next target position if available
		if(distance < 256)
		{
			this.positionIndex++;

			//console.log("Updating target: " + this.positionIndex.toString());

			if(this.positionIndex < this.arrNodePositions.length)
			{
				this.targetPosition = this.arrNodePositions[this.positionIndex];

				console.log();
			}
			else
			{
				this.arrNodePositions.length = 0;
			}
		}
	}
};

Navigation.prototype.clear = function() {
	this.arrNodePositions.length = 0;
	this.arrNodePositions = null;
};