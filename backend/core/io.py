import io
import os
import shutil
from pathlib import Path
from config.constants import DATA_PATH
from backend.core.logging import logger
from backend.core.utils import clean_string_for_storing

def concatenate_file_names(strings: list[str], n_max: int = 30) -> str:
    n = max(1, n_max // len(strings))
    result = ""
    for string in sorted(strings):
        result += f"-{string[:n]}"
    return clean_string_for_storing(result)

def get_data_source_and_save_path(files: list[io.BytesIO], name: str):
    if len(files) > 1:
        path = DATA_PATH / name
        data_source = path
    else:
        path = DATA_PATH
        data_source = path / files[0].name
    if not os.path.exists(path):
        os.makedirs(path)
    return str(data_source), path

def save_file(file: io.BytesIO, path: Path) -> None:
    file_path = str(path / file.name)
    file.seek(0)
    file_bytes = file.read()
    with open(file_path, "wb") as f:
        f.write(file_bytes)
    logger.info(f"Saved: {file_path}")

def save_files(files: list[io.BytesIO], name: str) -> str:
    if not files:
        return None
    data_source, path = get_data_source_and_save_path(files, name)
    for file in files:
        save_file(file, path)
    return str(data_source)

def delete_files(files: list[io.BytesIO], name: str):
    _, path = get_data_source_and_save_path(files, name)
    if os.path.exists(path):
        shutil.rmtree(path)
        logger.info(f"Deleted: {path}")
