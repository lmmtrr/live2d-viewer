import { resetValues, setOpacities, setting } from "./events.js";
import { currentModel } from "./main.js";

export function createDirSelector(dirFiles) {
  const dirSelector = document.getElementById("dirSelector");
  Object.keys(dirFiles).forEach((dir) => {
    let optionElement = document.createElement("option");
    optionElement.value = dir;
    optionElement.textContent = dir;
    dirSelector.appendChild(optionElement);
  });
}

export function createSceneSelector(sceneIds) {
  const sceneSelector = document.getElementById("sceneSelector");
  let s = "";
  for (let sceneId of sceneIds) {
    s += `<option value="${sceneId}">${sceneId}</option>`;
  }
  sceneSelector.innerHTML = s;
}

export function createAnimationSelector(motions) {
  let s = "";
  Object.keys(motions).forEach((key) => {
    motions[key].forEach((value, index) => {
      const file = value["file"] ? "file" : "File";
      s += `<option value="${key},${index}">${value[file]
        .split("/")
        .pop()}</option>`;
    });
  });
  document.getElementById("animationSelector").innerHTML = s;
}

function createParameterUI() {
  const parameterIds = currentModel.internalModel.coreModel._parameterIds;
  if (!parameterIds) return;
  const parameterMaximumValues =
    currentModel.internalModel.coreModel._parameterMaximumValues;
  const parameterMinimumValues =
    currentModel.internalModel.coreModel._parameterMinimumValues;
  const parameterValues = currentModel.internalModel.coreModel._parameterValues;
  const parameter = document.getElementById("parameter");
  parameter.style.display = "block";
  parameterIds.forEach((value, index) => {
    const div = document.createElement("div");
    div.className = "item";
    const label = document.createElement("label");
    label.title = value;
    label.textContent = value;
    const input = document.createElement("input");
    input.type = "range";
    input.max = parameterMaximumValues[index];
    input.min = parameterMinimumValues[index];
    input.step =
      (parameterMaximumValues[index] + parameterMinimumValues[index]) / 10;
    input.value = parameterValues[index];
    div.appendChild(label);
    div.appendChild(input);
    parameter.appendChild(div);
  });
}

function createPartUI() {
  const partIds = currentModel.internalModel.coreModel._partIds;
  if (!partIds) return;
  const a = partIds.map((value, index) => [value, index]);
  a.sort(function (a, b) {
    const sa = String(a).replace(/(\d+)/g, (m) => m.padStart(3, "0"));
    const sb = String(b).replace(/(\d+)/g, (m) => m.padStart(3, "0"));
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  });
  const part = document.getElementById("part");
  part.style.display = "none";
  for (let i = 0; i < a.length; i++) {
    const div = document.createElement("div");
    div.className = "item";
    const label = document.createElement("label");
    label.title = a[i][0];
    label.textContent = a[i][0];
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = "checked";
    input.dataset.oldIndex = String(a[i][1]);
    label.appendChild(input);
    div.appendChild(label);
    part.appendChild(div);
  }
}

function createDrawableUI() {
  const drawableIds = currentModel.internalModel.coreModel._drawableIds;
  if (!drawableIds) return;
  const opacities = new Float32Array(drawableIds.length);
  opacities.set(
    currentModel.internalModel.coreModel._model.drawables.opacities
  );
  setOpacities(opacities);
  const a = drawableIds.map((value, index) => [value, index]);
  a.sort(function (a, b) {
    const sa = String(a).replace(/(\d+)/g, (m) => m.padStart(3, "0"));
    const sb = String(b).replace(/(\d+)/g, (m) => m.padStart(3, "0"));
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  });
  const drawable = document.getElementById("drawable");
  drawable.style.display = "none";
  for (let i = 0; i < a.length; i++) {
    if (Math.round(opacities[a[i][1]])) {
      const div = document.createElement("div");
      div.className = "item";
      const label = document.createElement("label");
      label.title = a[i][0];
      label.textContent = a[i][0];
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = "checked";
      input.dataset.oldIndex = String(a[i][1]);
      label.appendChild(input);
      div.appendChild(label);
      drawable.appendChild(div);
    }
  }
}

export function resetUI() {
  resetValues();
  document.getElementById("container").scrollTop = 0;
  document.getElementById("parameter").innerHTML = "";
  document.getElementById("part").innerHTML = "";
  document.getElementById("drawable").innerHTML = "";
  createParameterUI();
  createPartUI();
  createDrawableUI();
}

export function switchUI() {
  const parameter = document.getElementById("parameter");
  const part = document.getElementById("part");
  const drawable = document.getElementById("drawable");
  switch (setting) {
    case "parameters":
      parameter.style.display = "block";
      part.style.display = "none";
      drawable.style.display = "none";
      break;
    case "parts":
      parameter.style.display = "none";
      part.style.display = "block";
      drawable.style.display = "none";
      break;
    case "drawables":
      parameter.style.display = "none";
      part.style.display = "none";
      drawable.style.display = "block";
      break;
  }
}
