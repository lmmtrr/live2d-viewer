import { custom, resetValues, setOpacities } from "./events.js";
import { currentModel } from "./main.js";

export function createFolderSelector(folders) {
  const folderSelector = document.getElementById("folderSelector");
  Object.keys(folders).forEach((folder) => {
    let optionElement = document.createElement("option");
    optionElement.value = folder;
    optionElement.textContent = folder;
    folderSelector.appendChild(optionElement);
  });
}

export function createCharacterSelector(charaIds) {
  const characterSelector = document.getElementById("characterSelector");
  let s = "";
  for (let charaId of charaIds) {
    s += `<option value="${charaId}">${charaId}</option>`;
  }
  characterSelector.innerHTML = s;
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
  const parameters = document.getElementById("parameters");
  parameters.style.display = "block";
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
    parameters.appendChild(div);
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
  const parts = document.getElementById("parts");
  parts.style.display = "none";
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
    parts.appendChild(div);
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
  const drawables = document.getElementById("drawables");
  drawables.style.display = "none";
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
      drawables.appendChild(div);
    }
  }
}

export function resetUI() {
  resetValues();
  document.getElementById("container").scrollTop = 0;
  document.getElementById("parameters").innerHTML = "";
  document.getElementById("parts").innerHTML = "";
  document.getElementById("drawables").innerHTML = "";
  createParameterUI();
  createPartUI();
  createDrawableUI();
}

export function switchUI() {
  const parameters = document.getElementById("parameters");
  const parts = document.getElementById("parts");
  const drawables = document.getElementById("drawables");
  switch (custom) {
    case "parameters":
      parameters.style.display = "block";
      parts.style.display = "none";
      drawables.style.display = "none";
      break;
    case "parts":
      parameters.style.display = "none";
      parts.style.display = "block";
      drawables.style.display = "none";
      break;
    case "drawables":
      parameters.style.display = "none";
      parts.style.display = "none";
      drawables.style.display = "block";
      break;
  }
}
