#!/usr/bin/env python3
"""
Onapookkal — Coupon Code Generator (GUI)

Generates a single-use coupon code tied to a customer's phone number and
inserts it directly into the production D1 database (via `npx wrangler`),
so it's immediately usable at checkout.

Offer types:
  • Discount %   → value = the percentage off the subtotal
  • Free delivery → value = 0, waives the delivery charge

The phone number is stored WITHOUT a country code (a leading "91" is stripped),
matching the checkout's normalization.

Run:  py -3.12 coupon_generator.py
      (or:  python coupon_generator.py)
"""

import os
import random
import string
import subprocess
import threading
import tkinter as tk
from tkinter import ttk

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = SCRIPT_DIR  # run wrangler from the project root (node_modules + wrangler.jsonc live here)
DB_NAME = "onapookkal-db"

# Ambiguous characters removed (no 0/O/1/I/L)
ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"


def normalize_phone(raw: str) -> str:
    """Digits only; strip a leading 91 country code."""
    digits = "".join(ch for ch in raw if ch.isdigit())
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    return digits


def generate_code(length: int = 8) -> str:
    return "".join(random.choice(ALPHABET) for _ in range(length))


def insert_coupon(code: str, ctype: str, value: int, phone: str) -> None:
    sql = (
        f"INSERT INTO coupons (code, type, value, phone, used) "
        f"VALUES ('{code}', '{ctype}', {value}, '{phone}', 0);"
    )
    cmd = f'npx wrangler d1 execute {DB_NAME} --remote --command="{sql}"'
    result = subprocess.run(
        cmd,
        shell=True,
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True,
        timeout=180,
    )
    output = (result.stdout or "") + (result.stderr or "")
    if result.returncode != 0:
        raise RuntimeError(f"wrangler exited {result.returncode}:\n{output.strip()[-600:]}")
    if '"success": true' not in output and '"success":true' not in output:
        raise RuntimeError(f"Insert may have failed:\n{output.strip()[-600:]}")


class App:
    def __init__(self, root: tk.Tk):
        self.root = root
        root.title("Onapookkal — Coupon Generator")
        root.geometry("440x460")
        root.resizable(False, False)

        pad = {"padx": 16, "pady": 6}
        frm = ttk.Frame(root, padding=20)
        frm.pack(fill="both", expand=True)

        ttk.Label(frm, text="Coupon Generator", font=("Segoe UI", 16, "bold")).pack(anchor="w", **pad)
        ttk.Label(
            frm,
            text="Tie a single-use coupon to a customer's phone number.",
            foreground="#666",
        ).pack(anchor="w", **pad)

        # Phone
        ttk.Label(frm, text="Customer phone number").pack(anchor="w", **pad)
        self.phone = ttk.Entry(frm, font=("Segoe UI", 12))
        self.phone.pack(fill="x", padx=16, pady=(0, 4))
        ttk.Label(frm, text="(country code +91 optional — stored without it)", foreground="#888").pack(
            anchor="w", padx=16
        )

        # Offer type
        ttk.Label(frm, text="Offer type").pack(anchor="w", **pad)
        self.ctype = tk.StringVar(value="percent")
        type_frame = ttk.Frame(frm)
        type_frame.pack(fill="x", padx=16)
        ttk.Radiobutton(type_frame, text="Discount %", variable=self.ctype, value="percent",
                        command=self.toggle_percent).pack(side="left")
        ttk.Radiobutton(type_frame, text="Free delivery", variable=self.ctype, value="free_delivery",
                        command=self.toggle_percent).pack(side="left", padx=(20, 0))

        # Percent
        ttk.Label(frm, text="Discount percentage").pack(anchor="w", **pad)
        self.percent = tk.IntVar(value=10)
        self.percent_spin = ttk.Spinbox(frm, from_=1, to=100, textvariable=self.percent, font=("Segoe UI", 12))
        self.percent_spin.pack(fill="x", padx=16)

        # Generate button
        self.gen_btn = ttk.Button(frm, text="Generate coupon", command=self.generate)
        self.gen_btn.pack(fill="x", padx=16, pady=(16, 8))

        # Status
        self.status = ttk.Label(frm, text="", foreground="#555", wraplength=400, justify="left")
        self.status.pack(anchor="w", padx=16)

        # Result
        self.result = tk.StringVar(value="")
        self.result_lbl = tk.Label(
            frm, textvariable=self.result, font=("Consolas", 20, "bold"),
            fg="#1a7f37", bg="#f6f8fa", relief="solid", bd=1,
        )
        self.result_lbl.pack(fill="x", padx=16, pady=(8, 4))

        self.copy_btn = ttk.Button(frm, text="Copy code", command=self.copy_code, state="disabled")
        self.copy_btn.pack(padx=16, pady=(0, 8))

        self.toggle_percent()

    def toggle_percent(self):
        state = "normal" if self.ctype.get() == "percent" else "disabled"
        self.percent_spin.config(state=state)

    def generate(self):
        phone = normalize_phone(self.phone.get())
        if len(phone) < 8:
            messagebox.showwarning("Phone", "Enter a valid phone number (at least 8 digits).")
            return
        ctype = self.ctype.get()
        if ctype == "percent":
            try:
                value = int(self.percent.get())
            except (tk.TclError, ValueError):
                messagebox.showwarning("Percent", "Enter a number between 1 and 100.")
                return
            if not (1 <= value <= 100):
                messagebox.showwarning("Percent", "Percent must be between 1 and 100.")
                return
        else:
            value = 0

        code = generate_code()

        self.gen_btn.config(state="disabled")
        self.status.config(text=f"Inserting {code} into D1 (remote)…", foreground="#555")
        self.result.set("")

        def worker():
            try:
                insert_coupon(code, ctype, value, phone)
                label = f"{value}% off" if ctype == "percent" else "free delivery"
                self.root.after(0, lambda: self.on_done(code, phone, label))
            except Exception as e:
                self.root.after(0, lambda: self.on_error(str(e)))

        threading.Thread(target=worker, daemon=True).start()

    def on_done(self, code, phone, label):
        self.gen_btn.config(state="normal")
        self.status.config(
            text=f"✓ Coupon {code} ({label}) saved for phone {phone} — ready at checkout.",
            foreground="#1a7f37",
        )
        self.result.set(code)
        self.copy_btn.config(state="normal")

    def on_error(self, msg):
        self.gen_btn.config(state="normal")
        self.status.config(text=f"✗ Error: {msg}", foreground="#b00020")
        self.result.set("")

    def copy_code(self):
        code = self.result.get()
        if code:
            self.root.clipboard_clear()
            self.root.clipboard_append(code)
            self.status.config(text="Copied to clipboard.", foreground="#555")


def main():
    root = tk.Tk()
    App(root)
    root.mainloop()


if __name__ == "__main__":
    main()
