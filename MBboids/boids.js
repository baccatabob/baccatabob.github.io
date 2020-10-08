	const viewportSize = 1440;
	const r = 1800;
	const numBoids = 750;
	const vectorLength = 25;

	// constants for not flying out of the bounding volume
	const marginAroundEdgeOfVolume = 100;
	const turnFactor = 2;

	var maxSpeedConstants =  {
		defaultValue: 10,
		min: 1,
		max: 100,
		step: 1
	};
	var maxSpeed = maxSpeedConstants.defaultValue;

	var visualRangeConstants =  {
		defaultValue: 150,
		min: 1,
		max: 500,
		step: 5
	};
	var visualRange = visualRangeConstants.defaultValue;
	
	var centringFactorConstants =  {
		defaultValue: 0.005,
		min: 0,
		max: 0.1,
		step: 0.001
	};
	var centringFactor = centringFactorConstants.defaultValue;

	const minDistance = 25; // The distance to stay away from other boids

	var avoidFactorConstants =  {
		defaultValue: 0.05,
		min: 0,
		max: 1,
		step: 0.01
	};
	var avoidFactor = avoidFactorConstants.defaultValue;

	// constant for matching velocities
	var matchingFactorConstants =  {
		defaultValue: 0.01,
		min: 0,
		max: 0.1,
		step: 0.001
	};
	var matchingFactor = matchingFactorConstants.defaultValue;

	// Holds two frames' data - the next one and the previous one.  In frame X, 0 = previous and 1 = next, then
	// in frame X+1, 0 = next and 1 = previous.
	var boids;
	var nextBoids, previousBoids;

	var distance = [];

	var flipFlop = 1;	// alternates between 0 and 1, to alternate between current and previous frames' data
	
	restartBoids();
	
    mathbox = mathBox({
      plugins: ['core', 'controls', 'cursor'],
      controls: {
        klass: THREE.OrbitControls
      },
    });
    
	three = mathbox.three;

    three.camera.position.set(2, 2, 2);
    three.renderer.setClearColor(new THREE.Color(0x000000), 1.0);

    time = 0
    three.on('update', function () {
      clock = three.Time.clock
      time = clock / 2
    });

	view = mathbox
      .cartesian({
        range: [[0, r], [0, r], [0, r]]
      });

    view.grid({
      width: 10,
      opacity: 0.1,
      axes: [1, 3],
    });

	function calcDistance(boidA, boidB) {
		var deltaX = boidA.from.x - boidB.from.x;
		var deltaY = boidA.from.y - boidB.from.y;
		var deltaZ = boidA.from.z - boidB.from.z;
		
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
	}
	
	function setBuffersForFrame() {
		previousBoids = boids[flipFlop];
		flipFlop = 1 - flipFlop;
		nextBoids = boids[flipFlop];
	}

	function initBoids(n) {
		
		boids = [[],[]];
		
		for (var i=0; i<n; i++) {
			var newBoid = initBoid();
			
			boids[0].push(newBoid);
			boids[1].push(newBoid);
		}
	}
	
	function initBoid() {
		var initX = randomInitPosition();
		var initY = randomInitPosition();
		var initZ = randomInitPosition();
		
		var initDX = randomInitSpeed();
		var initDY = randomInitSpeed();
		var initDZ = randomInitSpeed();
		
		return {from: {x:initX, y:initY, z:initZ}, to:{x:initX, y:initY, z:initY}, speed: {dx:initDX, dy:initDY, dz:initDZ}};
	}

	function randomInitPosition() {
		return r * Math.random();
	}
	
	function randomInitSpeed() {
		return maxSpeed * (Math.random() - 0.5);
	}

	function updatePoint(i) {
		// if there's anything we want to do once per frame, rather than once per boid, we do it here,
		// before processing the 0th boid
		if (i == 0) {
			setBuffersForFrame();
		}

		var nextVersionOfBoid = nextBoids[i];
		var previousVersionOfBoid = previousBoids[i];

		boidsAlgorithm(i, previousVersionOfBoid, nextVersionOfBoid);
		
		setToPosition(nextVersionOfBoid);
	}
	
	// This is the start of the boids algorithm proper

	function boidsAlgorithm(i, previousVersionOfBoid, nextVersionOfBoid) {
		
		nextVersionOfBoid.speed.dx = previousVersionOfBoid.speed.dx;
		nextVersionOfBoid.speed.dy = previousVersionOfBoid.speed.dy;
		nextVersionOfBoid.speed.dz = previousVersionOfBoid.speed.dz;
		
	    flyTowardsCentre(i, previousVersionOfBoid, nextVersionOfBoid);
		avoidOthers(i, previousVersionOfBoid, nextVersionOfBoid);
		matchVelocity(i, previousVersionOfBoid, nextVersionOfBoid);
		limitSpeed(i, previousVersionOfBoid, nextVersionOfBoid);
		keepWithinBounds(i, previousVersionOfBoid, nextVersionOfBoid);

		nextVersionOfBoid.from.x = previousVersionOfBoid.from.x + nextVersionOfBoid.speed.dx;
		nextVersionOfBoid.from.y = previousVersionOfBoid.from.y + nextVersionOfBoid.speed.dy;
		nextVersionOfBoid.from.z = previousVersionOfBoid.from.z + nextVersionOfBoid.speed.dz;
	}
		
	// Constrain a boid to within the window. If it gets too close to an edge, nudge it back in and reverse its direction.
	// This adjustment doesn't depend on any other boids, just the current one and its position.
	function keepWithinBounds(i, previousVersionOfBoid, nextVersionOfBoid) {

	  if (previousVersionOfBoid.from.x < marginAroundEdgeOfVolume) {
		nextVersionOfBoid.speed.dx += turnFactor;
	  }
	  
	  if (previousVersionOfBoid.from.x > r - marginAroundEdgeOfVolume) {
		nextVersionOfBoid.speed.dx -= turnFactor
	  }
	  
	  if (previousVersionOfBoid.from.y < marginAroundEdgeOfVolume) {
		nextVersionOfBoid.speed.dy += turnFactor;
	  }
	  
	  if (previousVersionOfBoid.from.y > r - marginAroundEdgeOfVolume) {
		nextVersionOfBoid.speed.dy -= turnFactor;
	  }

	  if (previousVersionOfBoid.from.z < marginAroundEdgeOfVolume) {
		nextVersionOfBoid.speed.dz += turnFactor;
	  }
	  
	  if (previousVersionOfBoid.from.z > r - marginAroundEdgeOfVolume) {
		nextVersionOfBoid.speed.dz -= turnFactor;
	  }
	}

	// Find the centre of mass of the other boids and adjust velocity slightly to
	// point towards the centre of mass.
	function flyTowardsCentre(i, previousVersionOfBoid, nextVersionOfBoid) {

		let centreX = 0;
		let centreY = 0;
		let centreZ = 0;

		let numNeighbours = 0;

		for(var j=0; j<numBoids; j++) {
			if (i == j) {continue;}

			var otherBoid = previousBoids[j];

			if (calcDistance(previousVersionOfBoid, otherBoid) < visualRange) {
				centreX += otherBoid.from.x;
				centreY += otherBoid.from.y;
				centreZ += otherBoid.from.z;
				numNeighbours += 1;
			}
		}

		if (numNeighbours) {
			centreX = centreX / numNeighbours;
			centreY = centreY / numNeighbours;
			centreZ = centreZ / numNeighbours;

			nextVersionOfBoid.speed.dx += (centreX - previousVersionOfBoid.from.x) * centringFactor;
			nextVersionOfBoid.speed.dy += (centreY - previousVersionOfBoid.from.y) * centringFactor;
			nextVersionOfBoid.speed.dz += (centreZ - previousVersionOfBoid.from.z) * centringFactor;
		}
	}

	// Move away from other boids that are too close to avoid colliding
	function avoidOthers(i, previousVersionOfBoid, nextVersionOfBoid) {

		let moveX = 0;
		let moveY = 0;
		let moveZ = 0;

		for(var j=0; j<numBoids; j++) {
			if (i == j) {continue;}

			var otherBoid = previousBoids[j];

			if (calcDistance(previousVersionOfBoid, otherBoid) < minDistance) {
				moveX += previousVersionOfBoid.from.x - otherBoid.from.x;
				moveY += previousVersionOfBoid.from.y - otherBoid.from.y;
				moveZ += previousVersionOfBoid.from.z - otherBoid.from.z;
			}
		}

		nextVersionOfBoid.speed.dx += moveX * avoidFactor;
		nextVersionOfBoid.speed.dy += moveY * avoidFactor;
		nextVersionOfBoid.speed.dz += moveZ * avoidFactor;
	}

	// Find the average velocity (speed and direction) of the other boids and
	// adjust velocity slightly to match.
	function matchVelocity(i, previousVersionOfBoid, nextVersionOfBoid) {

		let avgDX = 0;
		let avgDY = 0;
		let avgDZ = 0;
		let numNeighbours = 0;

		for(var j=0; j<numBoids; j++) {
			if (i == j) {continue;}

			var otherBoid = previousBoids[j];

			if (calcDistance(previousVersionOfBoid, otherBoid) < visualRange) {
				avgDX += otherBoid.speed.dx;
				avgDY += otherBoid.speed.dy;
				avgDZ += otherBoid.speed.dz;
				numNeighbours += 1;
			}
		}

		if (numNeighbours) {
			avgDX = avgDX / numNeighbours;
			avgDY = avgDY / numNeighbours;
			avgDZ = avgDZ / numNeighbours;
			
			var s = nextVersionOfBoid.speed;

			s.dx += (avgDX - s.dx) * matchingFactor;
			s.dy += (avgDY - s.dy) * matchingFactor;
			s.dz += (avgDZ - s.dz) * matchingFactor;
		}
	}

	// Speed will naturally vary in flocking behaviour, but real animals can't go arbitrarily fast.
	function limitSpeed(i, previousVersionOfBoid, nextVersionOfBoid) {
		var s = nextVersionOfBoid.speed;

		var speed = Math.sqrt(s.dx * s.dx + s.dy * s.dy + s.dz * s.dz);

		if (speed > maxSpeed) {
			s.dx = (s.dx / speed) * maxSpeed;
			s.dy = (s.dy / speed) * maxSpeed;
			s.dz = (s.dz / speed) * maxSpeed;
		}
	}

	// This is the end of the boids algorithm proper

	function setToPosition(boid) {
		
		var deltaX, deltaY, deltaZ;
		
		// if the boid is completely still, stop it from also having zero length by just
		// decreeing it's pointing along the X axis
		if (boid.speed.dx == 0 && boid.speed.dy == 0 && boid.speed.dz == 0) {
			deltaX = vectorLength;
			deltaY = 0;
			deltaZ = 0;
		} else {
			var dxsq = boid.speed.dx * boid.speed.dx;
			var dysq = boid.speed.dy * boid.speed.dy;
			var dzsq = boid.speed.dz * boid.speed.dz;
			
			var totalsq = dxsq + dysq + dzsq;
			
			deltaX = vectorLength * Math.sqrt(dxsq / totalsq);
			deltaY = vectorLength * Math.sqrt(dysq / totalsq);
			deltaZ = vectorLength * Math.sqrt(dzsq / totalsq);
			
			if (boid.speed.dx < 0) {deltaX *= -1;}
			if (boid.speed.dy < 0) {deltaY *= -1;}
			if (boid.speed.dz < 0) {deltaZ *= -1;}
		}
		
		boid.to.x = boid.from.x + deltaX;
		boid.to.y = boid.from.y + deltaY;		
		boid.to.z = boid.from.z + deltaZ;
	}

	function setSize() {
		var canvasList = document.getElementsByTagName("CANVAS");
		
		if (canvasList.length == 0) {console.log("Couldn't find canvas");}
		else {
			if (canvasList.length > 1) {console.log("Found too many canvas elements");}
			else {
				var c = canvasList[0];

				// wombat work out the current size, then set the canvas to just smaller than that (enough smaller to fit in the controls)
				c.style="height:1902;width:863;display:block; margin-left:0px; margin-top:10px; visibility:visibile;";
				c.onresize = function() {setSize();}
			}
		}
	}
	
	function initControls() {
		initControl('maxSpeed', maxSpeedConstants, maxSpeed, updateMaxSpeed);
		initControl('visualRange', visualRangeConstants, visualRange, updateVisualRange);
		initControl('centringFactor', centringFactorConstants, centringFactor, updateCentringFactor);
		initControl('avoidFactor', avoidFactorConstants, avoidFactor, updateAvoidFactor);
		initControl('matchingFactor', matchingFactorConstants, matchingFactor, updateMatchingFactor);
	}
	
	function initControl(label, constants, currentValue, updateFunction) {
		var fullLabel = "#" + label;
		
		$(fullLabel).rangeslider().attr({
			min: constants.min,
			max: constants.max,
			step: constants.step,
			value: currentValue
		})
		.on('input', function(){updateFunction(this.value);});
	}
	
	function updateMaxSpeed(value) {
		maxSpeed = value;
	}

	function updateVisualRange(value) {
		visualRange = value;
	}
	
	function updateCentringFactor(value) {
		centringFactor = value;
	}
	
	function updateAvoidFactor(value) {
		avoidFactor = value;
	}
	
	function updateMatchingFactor(value) {
		matchingFactor = value;
	}
	
	function resetValues() {
		resetValue('maxSpeed', maxSpeedConstants);
		resetValue('visualRange', visualRangeConstants);
		resetValue('centringFactor', centringFactorConstants);
		resetValue('avoidFactor', avoidFactorConstants);
		resetValue('matchingFactor', matchingFactorConstants);
	}
	
	function resetValue(label, constants) {
		var fullLabel = "#" + label;
		
		$(fullLabel).val(constants.defaultValue).change();
	}
	
	function restartBoids() {
		initBoids(numBoids);
		setBuffersForFrame();
	}
	
	setSize();

	initControls();

	view.array({
		width: numBoids,
		items: 2,
		channels: 3,
		expr: function(emit, i) {

			updatePoint(i);

			var from = nextBoids[i].from;
			emit(from.x, from.y, from.z);
			
			var to = nextBoids[i].to;
			emit(to.x, to.y, to.z);
		}
	});

    view.vector({
      color: 0xA0D0FF,
      width: 5,
      start: false,
      end: true,
	  size:5
    });

    vector = mathbox.select('vector')
