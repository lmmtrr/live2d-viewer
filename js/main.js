import { scale, sceneIndex, setupEventListeners } from "./events.js";
import { folder, folders, sceneIds } from "./setup.js";
import {
  createAnimationSelector,
  createSceneSelector,
  createFolderSelector,
  resetUI,
} from "./ui.js";

export let app;
export let currentModel;
const {
  live2d: { Live2DModel },
} = PIXI;

export async function load() {
  currentModel = await Live2DModel.from(
    `assets/${folder}/${sceneIds[sceneIndex]}`,
    { autoInteract: false }
  );
  currentModel.interactive = true;
  currentModel.scale.set(scale);
  currentModel.anchor.set(0.5, 0.5);
  currentModel.position.set(window.innerWidth * 0.5, window.innerHeight * 0.5);
  app.stage.addChild(currentModel);
  const motions = currentModel.internalModel.motionManager.definitions;
  if (motions) createAnimationSelector(motions);
  resetUI();
}

(async function main() {
  setupEventListeners();
  createFolderSelector(folders);
  createSceneSelector(sceneIds);
  app = new PIXI.Application({
    view: canvas,
    autoStart: true,
    resizeTo: window,
  });
  await load();
})();
