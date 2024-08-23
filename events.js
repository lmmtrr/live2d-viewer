import { app, load, currentModel } from "./main.js";
import { charaIds, folder, folders, setCharaIds, setFolder } from "./setup.js";
import { createCharacterSelector, switchUI } from "./ui.js";

const scaleInit = 1;
const scaleMax = 2;
const scaleMin = 0.1;
const scaleStep = 0.1;
const rotateStep = 0.001;
export const moveStep = 0.00001;
export let scale = scaleInit;
export let moveX = 0;
export let moveY = 0;
export let rotate = 0;
export let charaIndex = 0;
let startX = 0;
let startY = 0;
let mouseDown = false;
let isMove = false;
export let premultipliedAlpha = false;
export let custom = "parameters";
let opacities;

const canvas = document.getElementById("canvas");
const toggleButton = document.getElementById("toggleButton");
const folderSelector = document.getElementById("folderSelector");
const characterSelector = document.getElementById("characterSelector");
const animationSelector = document.getElementById("animationSelector");
const customSelector = document.getElementById("customSelector");
const filterBox = document.getElementById("filterBox");
const container = document.getElementById("container");

export function setOpacities(value) {
  opacities = value;
}

export function resetValues() {
  scale = scaleInit;
  moveX = 0;
  moveY = 0;
  rotate = 0;
  custom = "parameters";
  customSelector.value = "parameters";
  filterBox.value = "";
}

export function setupEventListeners() {
  window.addEventListener("resize", handleResize);
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("mouseout", handleMouseOut);
  canvas.addEventListener("wheel", handleWheel);
  toggleButton.addEventListener("click", toggleSidebar);
  folderSelector.addEventListener("change", handleFolderChange);
  characterSelector.addEventListener("change", handleCharacterChange);
  animationSelector.addEventListener("change", handleAnimationChange);
  customSelector.addEventListener("change", handleCustomChange);
  filterBox.addEventListener("input", handleFilterInput);
  container.addEventListener("input", handleCheckboxChange);
}

function handleResize() {
  const { innerWidth: w, innerHeight: h } = window;
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
}

function handleMouseDown(e) {
  if (e.button === 2) return;
  startX = e.clientX;
  startY = e.clientY;
  mouseDown = true;
  isMove = e.clientX < canvas.width - 250 && e.clientX > 250;
}

function updateCursorStyle(e) {
  document.body.style.cursor = "default";
  if (e.clientX >= canvas.width - 250)
    document.body.style.cursor = `url("../cursors/rotate_right.svg"), auto`;
  else if (e.clientX <= 250)
    document.body.style.cursor = `url("../cursors/rotate_left.svg"), auto`;
}

function handleMouseMove(e) {
  updateCursorStyle(e);
  if (!mouseDown) return;
  if (isMove) {
    moveX += e.clientX - startX;
    moveY += e.clientY - startY;
    currentModel.position.set(
      window.innerWidth * 0.5 + moveX,
      window.innerHeight * 0.5 + moveY
    );
  } else {
    rotate +=
      (e.clientY - startY) *
      rotateStep *
      (e.clientX >= canvas.width - 250 ? 1 : -1);
    currentModel.rotation = rotate;
  }
  startX = e.clientX;
  startY = e.clientY;
}

function handleMouseUp() {
  mouseDown = false;
  isMove = false;
}

function handleMouseOut() {
  handleMouseUp();
}

function handleWheel(e) {
  e.preventDefault();
  scale = Math.min(
    scaleMax,
    Math.max(scaleMin, scale - Math.sign(e.deltaY) * scaleStep)
  );
  currentModel.scale.set(scale, scale, 10);
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("close");
}

function handleFolderChange(e) {
  setFolder(e.target.value);
  setCharaIds(folders[folder]);
  createCharacterSelector(charaIds);
  charaIndex = 0;
  resetValues();
  if (app.stage.children.length > 0) app.stage.removeChildAt(0);
  load();
}

async function handleCharacterChange(e) {
  charaIndex = e.target.selectedIndex;
  resetValues();
  if (app.stage.children.length > 0) app.stage.removeChildAt(0);
  load();
}

function handleAnimationChange(e) {
  const [motion, index] = e.target.value.split(",");
  const motionManager = app.stage.children[0].internalModel.motionManager;
  motionManager.stopAllMotions();
  motionManager.startMotion(motion, Number(index), 1);
}

function handleCustomChange(e) {
  custom = e.target.value;
  switchUI();
}

function handleFilterInput(e) {
  const filterValue = e.target.value.toLowerCase();
  container.querySelectorAll(".item").forEach((item) => {
    const title = item
      .querySelector("label")
      .getAttribute("title")
      .toLowerCase();
    item.style.display =
      title.includes(filterValue) || filterValue === "" ? "flex" : "none";
  });
}

function handleParameterSliderChange(e) {
  const inputs = Array.from(
    document.getElementById("parameter").querySelectorAll('input[type="range"]')
  );
  const index = inputs.indexOf(e.target);
  const parameterValues = currentModel.internalModel.coreModel._parameterValues;
  parameterValues[index] = e.target.value;
}

function handlePartCheckboxChange(e) {
  currentModel.internalModel.coreModel.setPartOpacityById(
    e.target.previousSibling.textContent,
    +e.target.checked
  );
}

function handleDrawableCheckboxChange(e) {
  opacities[Number(e.target.getAttribute("data-old-index"))] =
    +e.target.checked;
  currentModel.internalModel.coreModel._model.drawables.opacities = opacities;
}

function handleCheckboxChange(e) {
  switch (custom) {
    case "parameters":
      handleParameterSliderChange(e);
      break;
    case "parts":
      handlePartCheckboxChange(e);
      break;
    case "drawables":
      handleDrawableCheckboxChange(e);
      break;
  }
}
