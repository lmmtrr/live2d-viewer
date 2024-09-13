from collections import OrderedDict
from pathlib import Path
import json
import os


def find_model_files(base_dir):
    dir_files = {}
    base_path = Path(base_dir)
    for dir in (d for d in base_path.iterdir() if d.is_dir()):
        model_files = []
        for pattern in ("*.model.json", "*.model3.json"):
            for file in dir.rglob(pattern):
                model_files.append(os.path.relpath(file, f"../assets/{dir}"))
        if model_files:
            dir_files[dir.name] = model_files
    return dir_files


dir_files = find_model_files("../assets/")
dir_files = OrderedDict(sorted(dir_files.items(), key=lambda t: t[0]))

with open("../js/setup.js", "w", encoding="utf-8") as f:
    first_dir = sorted(dir_files.keys())[0]
    f.write(f'export let dir = "{first_dir}";\n')
    f.write(f"export const dirFiles = {json.dumps(dir_files)};\n")
    f.write(f"export let sceneIds = {json.dumps(dir_files[first_dir])};\n")
    f.write(f"export function setDir(value) {{\n")
    f.write(f"  dir = value;\n")
    f.write(f"}}\n")
    f.write(f"export function setSceneIds(value) {{\n")
    f.write(f"  sceneIds = value;\n")
    f.write(f"}}\n")
