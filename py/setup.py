from collections import OrderedDict
from pathlib import Path
import json
import os


def find_model_files(base_dir):
    result = {}
    base_path = Path(base_dir)
    for folder in (d for d in base_path.iterdir() if d.is_dir()):
        model_files = []
        for pattern in ("*.model.json", "*.model3.json"):
            for file in folder.rglob(pattern):
                model_files.append(os.path.relpath(file, f"../assets/{folder}"))
        if model_files:
            result[folder.name] = model_files
    return result


folders = find_model_files("../assets/")
folders = OrderedDict(sorted(folders.items(), key=lambda t: t[0]))

with open("../js/setup.js", "w", encoding="utf-8") as f:
    first_folder = sorted(folders.keys())[0]
    f.write(f'export let folder = "{first_folder}";\n')
    f.write(f"export const folders = {json.dumps(folders)};\n")
    f.write(f"export let sceneIds = {json.dumps(folders[first_folder])};\n")
    f.write(f"export function setFolder(value) {{\n")
    f.write(f"  folder = value;\n")
    f.write(f"}}\n")
    f.write(f"export function setSceneIds(value) {{\n")
    f.write(f"  sceneIds = value;\n")
    f.write(f"}}\n")
