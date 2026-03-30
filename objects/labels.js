import * as THREE from "three";

const tmpLabelWorldPos = new THREE.Vector3();

export function createLabel(text, { toggleLabelsInput }) {
  const label = document.createElement("div");
  label.className = "label";
  label.textContent = text;
  label.style.display = toggleLabelsInput?.checked ? "block" : "none";
  document.body.append(label);
  return label;
}

export function projectLabel(entry, worldPos, { toggleLabelsInput, camera }) {
  if (!toggleLabelsInput?.checked) return;

  tmpLabelWorldPos.copy(worldPos).project(camera);

  const x = (tmpLabelWorldPos.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-tmpLabelWorldPos.y * 0.5 + 0.5) * window.innerHeight;
  const hidden = tmpLabelWorldPos.z > 1 || tmpLabelWorldPos.z < -1;

  entry.label.style.display = hidden ? "none" : "block";
  entry.label.style.left = `${x}px`;
  entry.label.style.top = `${y}px`;
}

