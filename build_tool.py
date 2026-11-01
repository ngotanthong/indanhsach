#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build anh nen JPEG cho tool "so-dep".

Chay:  python3 build_tool.py
Muon doi anh nen: thay file bckground.png roi chay lai lenh tren.
(Tool chinh la index.html, mo truc tiep duoc; file nay chi tao lai bckground.jpg.)
"""
import pathlib

from PIL import Image

def main():
    png_path = pathlib.Path("bckground.png")
    jpg_path = pathlib.Path("bckground.jpg")
    if png_path.exists():
        im = Image.open(png_path).convert("RGB")
        im.save(jpg_path, "JPEG", quality=90, optimize=True, progressive=True)
        print(f"da tao {jpg_path}  ({jpg_path.stat().st_size/1e3:.0f} KB) tu {png_path}")
    elif not jpg_path.exists():
        print("CANH BAO: khong tim thay bckground.png hoac bckground.jpg")
    else:
        print(f"giu nguyen {jpg_path}")

if __name__ == "__main__":
    main()