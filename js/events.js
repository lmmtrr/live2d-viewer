import { app, currentModel, load } from "./main.js";
import { dir, dirFiles, sceneIds, setDir, setSceneIds } from "./setup.js";
import { createSceneSelector, switchUI } from "./ui.js";

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
export let sceneIndex = 0;
let startX = 0;
let startY = 0;
let mouseDown = false;
let isMove = false;
export let premultipliedAlpha = false;
export let setting = "parameters";
let opacities;

const rootStyles = getComputedStyle(document.documentElement);
const sidebarWidth = Number(
  rootStyles.getPropertyValue("--sidebar-width").replace("px", "")
);

const canvas = document.getElementById("canvas");
const toggleButton = document.getElementById("toggleButton");
const dirSelector = document.getElementById("dirSelector");
const sceneSelector = document.getElementById("sceneSelector");
const animationSelector = document.getElementById("animationSelector");
const settingSelector = document.getElementById("settingSelector");
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
  setting = "parameters";
  settingSelector.value = "parameters";
  filterBox.value = "";
}

export function setupEventListeners() {
  document.onkeydown = handleKeyboardInput;
  window.addEventListener("resize", handleResize);
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("mouseout", handleMouseOut);
  canvas.addEventListener("wheel", handleWheel);
  toggleButton.addEventListener("click", toggleSidebar);
  dirSelector.addEventListener("change", handleDirChange);
  sceneSelector.addEventListener("change", handleSceneChange);
  animationSelector.addEventListener("change", handleAnimationChange);
  settingSelector.addEventListener("change", handlesettingChange);
  filterBox.addEventListener("input", handleFilterInput);
  container.addEventListener("input", handleCheckboxChange);
}

function nextScene() {
  sceneSelector.focus();
  sceneIndex = (sceneSelector.selectedIndex + 1) % sceneSelector.options.length;
  sceneSelector.selectedIndex = sceneIndex;
  handleSceneChange_();
}

function nextAnimation() {
  animationSelector.focus();
  let animationIndex =
    (animationSelector.selectedIndex + 1) % animationSelector.options.length;
  animationSelector.selectedIndex = animationIndex;
  const [motion, index] = animationSelector.value.split(",");
  handleAnimationChange_(motion, index);
}

function handleKeyboardInput(e) {
  if (!e.ctrlKey) return;
  switch (e.key) {
    case "s":
      e.preventDefault();
      nextScene();
      break;
    case "a":
      e.preventDefault();
      nextAnimation();
      break;
  }
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
  isMove = e.clientX < canvas.width - sidebarWidth && e.clientX > sidebarWidth;
}

function updateCursorStyle(e) {
  document.body.style.cursor = "default";
  if (e.clientX >= canvas.width - sidebarWidth)
    document.body.style.cursor = `url("../cursors/rotate_right.svg"), auto`;
  else if (e.clientX <= sidebarWidth)
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
      (e.clientX >= canvas.width - sidebarWidth ? 1 : -1);
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

function handleDirChange(e) {
  setDir(e.target.value);
  setSceneIds(dirFiles[dir]);
  createSceneSelector(sceneIds);
  sceneIndex = 0;
  resetValues();
  if (app.stage.children.length > 0) app.stage.removeChildAt(0);
  load();
}

async function handleSceneChange_() {
  resetValues();
  if (app.stage.children.length > 0) app.stage.removeChildAt(0);
  load();
}

async function handleSceneChange(e) {
  sceneIndex = e.target.selectedIndex;
  handleSceneChange_();
}

async function handleAnimationChange_(motion, index) {
  const motionManager = app.stage.children[0].internalModel.motionManager;
  motionManager.stopAllMotions();
  motionManager.startMotion(motion, Number(index), 1);
}

function handleAnimationChange(e) {
  const [motion, index] = e.target.value.split(",");
  handleSceneChange_(motion, index);
}

function handlesettingChange(e) {
  setting = e.target.value;
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
  switch (setting) {
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
