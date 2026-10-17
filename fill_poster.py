#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Dien so thue bao + cam ket vao anh poster VinaPhone (bckground.png).

Cach dung:
  1. Sua danh sach DATA ben duoi.
  2. Chay:  python3 fill_poster.py
  3. Ket qua: poster_filled.png  (va poster_filled@2x.png cho ban in net hon)
"""

from PIL import Image, ImageDraw, ImageFont

# ============ DU LIEU GOC (sua o day) ============
# (So thue bao, Cam ket) -- giu NGUYEN VAN nhu anh go
DATA = [
    ("0822 88 8085", "150k"),
    ("0812 07 8778", "200k"),
    ("0834 66 0246", "0"),
    ("0842 05 4242", "100k"),
    ("0852 99 9024", "150k"),
    ("0846 74 7979", "1500k"),
    ("0886 02 3939", "1500k"),
    ("0888 61 0660", "100k"),
    ("0849 91 4747", "200k"),
    ("0836 66 6022", "150k"),
    ("0813 65 1661", "200k"),
    ("0822 87 1881", "200k"),
]

BG      = "bckground.png"
OUT_1X  = "poster_filled.png"
OUT_2X  = "poster_filled@2x.png"
FONT    = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

# ---- Toa do do tu anh goc (he 1x, 1448 x 1086) ----
# Tam cac hang (10 hang trong bang)
ROW_Y = [489.5, 533.5, 579.0, 624.0, 669.0, 714.0, 760.0, 806.0, 851.5, 898.5]
# Tam cot cho tung khoi: (tam cot So thue bao, tam cot CK)
BLOCKS = [
    (271.0, 451.0),    # khoi 1: STT 1..10
    (727.5, 900.0),    # khoi 2: STT 11..20
    (1178.0, 1351.5),  # khoi 3: STT 21..30
]
START = [1, 11, 21]        # STT bat dau cua moi khoi
FONT_SIZE = 31             # co chu o ban 1x
COL_SDT   = (18, 34, 66)   # mau so thue bao (xanh dam)
COL_CK    = (192, 32, 26)  # mau cam ket (do)


def draw_center(d, cx, cy, text, font, fill):
    l, t, r, b = d.textbbox((0, 0), text, font=font)
    d.text((cx - (r - l) / 2 - l, cy - (b - t) / 2 - t), text, font=font, fill=fill)


def build(scale: int, out: str):
    base = Image.open(BG).convert("RGB")
    if scale != 1:
        base = base.resize((base.width * scale, base.height * scale), Image.LANCZOS)
    d = ImageDraw.Draw(base)
    font = ImageFont.truetype(FONT, FONT_SIZE * scale)

    for bi, (x_sdt, x_ck) in enumerate(BLOCKS):
        for i, cy in enumerate(ROW_Y):
            idx = START[bi] + i - 1          # vi tri trong DATA
            if idx >= len(DATA):
                continue
            sdt, ck = DATA[idx]
            draw_center(d, x_sdt * scale, cy * scale, sdt, font, COL_SDT)
            draw_center(d, x_ck * scale,  cy * scale, ck,  font, COL_CK)

    base.save(out, "PNG")
    print("da tao:", out, base.size)


if __name__ == "__main__":
    build(1, OUT_1X)
    build(2, OUT_2X)
