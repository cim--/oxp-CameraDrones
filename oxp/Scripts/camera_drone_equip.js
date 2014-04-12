this.name = "Camera Drones equipment script";

this.activated = function() {
		worldScripts["Camera Drones"]._toggle.bind(worldScripts["Camera Drones"])();
}

this.mode = function() {
		worldScripts["Camera Drones"]._cycle.bind(worldScripts["Camera Drones"])();
}


