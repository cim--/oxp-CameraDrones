Provides Camera Drones equipment item. Purchase for 1000Cr. at any
TL:8 system.

Shift-n to select it, and n to activate or deactivate it. When active,
your external view will be replaced with a customised camera from our
micro-drones. We provide four settings, which can be cycled between
by pressing 'b'. Additional programmes for micro-drones may be
available from other good retailers.

Setting 1: missile camera. Launch a missile, then activate the camera
and switch to external view to follow it.

Setting 2: fly-by cameras (various speeds and distances available).

Setting 3: docking camera. Set up and activate the camera, turn on
your docking computers, and switch to external view to see what
traffic control sees.

Setting 4: target camera. See a simulation of your current target's
forward view or close-ups from various angles.

----------

Additional settings:
OXPs can add additional camera drone settings by calling
worldScripts["Camera Drones"]._registerCamera(obj);

obj is an object with the following keys:
 - name: the name of the camera

 - cameraPosition: a function which returns either a vector describing
   the camera position in world coordinates, or null if this camera is
   no longer valid and should be deactivated.

 - cameraDirection: a function which returns either a vector
   describing the camera orientation in world coordinates, or null if
   the camera should point at the player without rotation.

 - initialisation: (optional) a function run once when the camera is
   selected to set up parameters

 - update: (optional) a function called each frame with 'delta'
   parameter for the frame length (like a frame callback) to modify
   camera parameters while it is active.

-----------

Thanks to Thargoid for figuring out the quaternion maths needed for
the docking cam.
