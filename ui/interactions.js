export function onPointerDown(event, deps) {
  const {
    renderer,
    mouse,
    raycaster,
    camera,
    clickableMeshes,
    clearPlanetInfoDrawer,
    updatePlanetInfoDrawer,
    planetInfoDrawer,
    planetInfoName,
    planetInfoType,
    planetInfoBody,
  } = deps;

  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(clickableMeshes, true);

  if (!intersects.length) {
    clearPlanetInfoDrawer({
      planetInfoDrawer,
      planetInfoName,
      planetInfoType,
      planetInfoBody,
    });
    return;
  }

  let clickedObject = intersects[0].object;

  while (clickedObject && !clickedObject.userData?.clickable) {
    clickedObject = clickedObject.parent;
  }

  if (!clickedObject || !clickedObject.userData?.bodyName) {
    clearPlanetInfoDrawer({
      planetInfoDrawer,
      planetInfoName,
      planetInfoType,
      planetInfoBody,
    });
    return;
  }

  updatePlanetInfoDrawer(clickedObject.userData.bodyName, {
    planetInfoDrawer,
    planetInfoName,
    planetInfoType,
    planetInfoBody,
  });
}
