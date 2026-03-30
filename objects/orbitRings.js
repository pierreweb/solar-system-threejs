import * as THREE from "three";

export function createOrbitRing(distance, { group, orbitRingObjects }) {
  const orbitRing = new THREE.Mesh(
    new THREE.RingGeometry(distance - 0.13, distance + 0.13, 256),
    new THREE.MeshBasicMaterial({
      color: 0x8d85aa,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    }),
  );
  orbitRing.rotation.x = Math.PI / 2;
  group.add(orbitRing);
  orbitRingObjects.push(orbitRing);
  return orbitRing;
}
