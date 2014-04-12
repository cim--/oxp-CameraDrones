this.name = "Camera Drones";

this.startUp = function() {
		this.$camActive = 0;
		this.$camFunctions = new Array;
		this.$track = null;

		this._registerCamera({name:"Missile Camera",
													cameraPosition:this._missileCamPosition.bind(this),
													cameraVector:this._missileCamDirection.bind(this)});
		this._registerCamera({name:"Flyby Camera (fast)",
													initialisation:this._flybyCamInit.bind(this),
													update:this._flybyCamUpdate.bind(this),
													cameraPosition:this._flybyCamPosition.bind(this),
													cameraVector:this._flybyCamDirection.bind(this)});
		this._registerCamera({name:"Flyby Camera (medium)",
													initialisation:this._flybyCamInit.bind(this),
													update:this._flybyCamUpdate2.bind(this),
													cameraPosition:this._flybyCamPosition.bind(this),
													cameraVector:this._flybyCamDirection.bind(this)});
		this._registerCamera({name:"Flyby Camera (slow)",
													initialisation:this._flybyCamInit.bind(this),
													update:this._flybyCamUpdate3.bind(this),
													cameraPosition:this._flybyCamPosition.bind(this),
													cameraVector:this._flybyCamDirection.bind(this)});
		this._registerCamera({name:"Docking Camera",
													initialisation:this._dockingCamInit.bind(this),
													cameraPosition:this._dockingCamPosition.bind(this),
													cameraVector:this._dockingCamDirection.bind(this)});
		this._registerCamera({name:"Target Camera",
													cameraPosition:this._targetCamPosition.bind(this),
													cameraVector:this._targetCamDirection.bind(this)});


}

this.equipmentDamaged = function(equip) {
		if (equip == "EQ_CAMERA_DRONES") {
				this._deactivate();
		}
}

this._toggle = function() {
		if (this.$camActive) {
				this._deactivate();
		} else {
				this._activate();
		}
}

this._deactivate = function() {
		if (this.$camActive) {
				this.$camActive = 0;
				this._resetCamera();
				removeFrameCallback(this.$track);
				player.consoleMessage("Drone camera deactivated");
		}
}

this._activate = function() {
		this.$track = addFrameCallback(this._track.bind(this));
		this.$camActive = 1;
		player.consoleMessage("Drone camera activated: external view to watch");
}

this._resetCamera = function() {
		if (player.ship.viewDirection != "VIEW_CUSTOM") { return; }
		player.ship.setCustomView([0,0,player.ship.collisionRadius*-5],[1,0,0,0]);
}


this._track = function(delta) {
		if (player.ship.viewDirection != "VIEW_CUSTOM") { return; }

		var tracker = this.$camFunctions[0];
		
		if (tracker.update) {
				tracker.update(delta);
		}

		var pos = tracker.cameraPosition();
		if (pos == null) {
				this._deactivate();
				return;
		}
		pos = pos.subtract(player.ship.position);

		var posipcc = new Vector3D(0,0,0);
		var px = player.ship.vectorRight;
		var py = player.ship.vectorUp;
		var pz = player.ship.vectorForward;

// if you understand quaternions there is probably an easier way to do this!
		posipcc.x = pos.x * px.dot([1,0,0]) + pos.y * px.dot([0,1,0]) + pos.z * px.dot([0,0,1]);
		posipcc.y = pos.x * py.dot([1,0,0]) + pos.y * py.dot([0,1,0]) + pos.z * py.dot([0,0,1]);
		posipcc.z = pos.x * pz.dot([1,0,0]) + pos.y * pz.dot([0,1,0]) + pos.z * pz.dot([0,0,1]);

		var trackVector = tracker.cameraVector();
		if (trackVector == null) {
				trackVector = pos.multiply(-1);
				var quat = trackVector.direction().rotationTo([0,0,1]).multiply(player.ship.orientation.conjugate());
		} else {
				var camVector = trackVector.direction();
				var mvfipcc = new Vector3D(0,0,0);

				mvfipcc.x = camVector.x * px.dot([1,0,0]) + camVector.y * px.dot([0,1,0]) + camVector.z * px.dot([0,0,1]);
				mvfipcc.y = camVector.x * py.dot([1,0,0]) + camVector.y * py.dot([0,1,0]) + camVector.z * py.dot([0,0,1]);
				mvfipcc.z = camVector.x * pz.dot([1,0,0]) + camVector.y * pz.dot([0,1,0]) + camVector.z * pz.dot([0,0,1]);

				var quat = mvfipcc.rotationTo([0,0,1]);
		}

		player.ship.setCustomView(posipcc,quat);
}

this._registerCamera = function(obj) {
		this.$camFunctions.push(obj);
}

this._cycle = function() {
		this.$camFunctions.push(this.$camFunctions.shift());
		player.consoleMessage("Selected camera: "+this.$camFunctions[0].name);
		if (this.$camFunctions[0].initialisation) {
				this.$camFunctions[0].initialisation();
		}
}

/*** Built in cameras ***/

/* Missile camera */

this.shipFiredMissile = function(missile,target) {
		this.$missile = missile;
}

this._missileCamPosition = function() {
		if (!this.$missile || !this.$missile.isValid) {
				return null;
		}
		return this.$missile.position.subtract(this.$missile.vectorForward.multiply(150)).add(this.$missile.vectorUp.multiply(10));
}

this._missileCamDirection = function() {
		return this.$missile.vectorForward;
}

/* Fly-by cameras */

this._flybyCamInit = function() {
		var angle = Math.random()*2*Math.PI;
		this.$startVector = new Vector3D(player.ship.collisionRadius*2*Math.sin(angle),player.ship.collisionRadius*2*Math.cos(angle),player.ship.collisionRadius*20);
}

this._flybyCamUpdate = function(delta) {
		this.$startVector.z -= delta * 500;
		if (this.$startVector.z < -player.ship.collisionRadius*20) {
				this._flybyCamInit();
		}
}

this._flybyCamUpdate2 = function(delta) {
		this.$startVector.z -= delta * 300;
		if (this.$startVector.z < -player.ship.collisionRadius*20) {
				this._flybyCamInit();
		}
}

this._flybyCamUpdate3 = function(delta) {
		this.$startVector.z -= delta * 100;
		if (this.$startVector.z < -player.ship.collisionRadius*20) {
				this._flybyCamInit();
		}
}

this._flybyCamPosition = function() {
		return player.ship.position.add(player.ship.vectorForward.multiply(this.$startVector.z)).add(player.ship.vectorUp.multiply(this.$startVector.y)).add(player.ship.vectorRight.multiply(this.$startVector.x));
}

this._flybyCamDirection = function() {
		return player.ship.vectorForward.multiply(this.$startVector.z).add(player.ship.vectorUp.multiply(this.$startVector.y)).add(player.ship.vectorRight.multiply(this.$startVector.x)).multiply(-1);
}

/* Docking camera */

this._dockingCamInit = function() {
		var stations = system.filteredEntities(this,function(entity){return entity.isStation;},player.ship,25600);
		if (stations.length > 0) {
				this.$station = stations[0];
		} else {
				this.$station = system.mainStation;
		}
}

this._dockingCamPosition = function() {
		if (!this.$station || !this.$station.isValid) {
				return null;
		}

		return this.$station.position.add(this.$station.vectorForward.multiply((this.$station.boundingBox.z/2)+250)).add(this.$station.vectorRight.multiply(350)).add(this.$station.vectorUp.multiply(175));
}

this._dockingCamDirection = function() {
		return null; // track player ship
}

/* Target camera */

this._targetCamPosition = function() {
		if (player.ship.target && player.ship.target.isShip) {
				return player.ship.target.position;
		}
		return null;
}

this._targetCamDirection = function() {
		return player.ship.target.vectorForward;
}