"""
╔══════════════════════════════════════════════════════════╗
║   FACE RECOGNITION ATTENDANCE SYSTEM  –  GUI Edition     ║
║   Bonus: Tkinter UI + Add New Faces Dynamically          ║
╚══════════════════════════════════════════════════════════╝
"""

import cv2
import face_recognition
import numpy as np
import os
import csv
import shutil
import threading
from datetime import datetime
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from PIL import Image, ImageTk   # pip install Pillow


# ─── CONFIG ──────────────────────────────────────────────
IMAGES_FOLDER   = "ImagesAttendance"
ATTENDANCE_FILE = "Attendance.csv"
FRAME_SCALE     = 0.25
TOLERANCE       = 0.50


# ─────────────────────────────────────────────────────────
#  CORE LOGIC  (shared with CLI version)
# ─────────────────────────────────────────────────────────
def load_known_faces(folder):
    known_encodings, known_names = [], []
    if not os.path.isdir(folder):
        os.makedirs(folder, exist_ok=True)
        return known_encodings, known_names

    supported = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    for filename in os.listdir(folder):
        if os.path.splitext(filename)[1].lower() not in supported:
            continue
        path = os.path.join(folder, filename)
        name = os.path.splitext(filename)[0].replace("_", " ").replace("-", " ")
        img  = cv2.imread(path)
        if img is None:
            continue
        rgb  = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encs = face_recognition.face_encodings(rgb)
        if encs:
            known_encodings.append(encs[0])
            known_names.append(name)
    return known_encodings, known_names


def initialize_csv(filepath):
    if not os.path.isfile(filepath):
        with open(filepath, "w", newline="") as f:
            csv.writer(f).writerow(["Name", "Date", "Time"])


def mark_attendance(name, filepath, marked_today):
    if name in marked_today:
        return False
    now = datetime.now()
    with open(filepath, "a", newline="") as f:
        csv.writer(f).writerow([name, now.strftime("%Y-%m-%d"), now.strftime("%H:%M:%S")])
    marked_today.add(name)
    return True


# ─────────────────────────────────────────────────────────
#  GUI APPLICATION CLASS
# ─────────────────────────────────────────────────────────
class AttendanceApp:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Face Recognition Attendance System")
        self.root.configure(bg="#1a1a2e")
        self.root.resizable(False, False)

        # State
        self.cap             = None
        self.running         = False
        self.known_encodings = []
        self.known_names     = []
        self.marked_today    = set()
        self.face_locs       = []
        self.face_names      = []
        self.process_frame   = True
        self._thread         = None

        initialize_csv(ATTENDANCE_FILE)
        self._build_ui()
        self._reload_faces()

    # ── UI CONSTRUCTION ───────────────────────────────────
    def _build_ui(self):
        # ---- Header ----
        hdr = tk.Frame(self.root, bg="#16213e", pady=10)
        hdr.grid(row=0, column=0, columnspan=2, sticky="ew")
        tk.Label(
            hdr, text="🎓  Face Recognition Attendance",
            font=("Segoe UI", 16, "bold"),
            fg="#e94560", bg="#16213e"
        ).pack()
        tk.Label(
            hdr, text="Real-time · Auto-log · CSV Export",
            font=("Segoe UI", 9), fg="#8892b0", bg="#16213e"
        ).pack()

        # ---- Camera feed ----
        cam_frame = tk.Frame(self.root, bg="#0f3460", bd=2, relief="ridge")
        cam_frame.grid(row=1, column=0, padx=12, pady=10)
        self.canvas = tk.Canvas(cam_frame, width=640, height=480, bg="#000", highlightthickness=0)
        self.canvas.pack()

        # ---- Right panel ----
        right = tk.Frame(self.root, bg="#1a1a2e")
        right.grid(row=1, column=1, padx=(0, 12), pady=10, sticky="ns")

        # Status box
        stat_box = tk.LabelFrame(right, text=" Status ", bg="#1a1a2e", fg="#64ffda",
                                  font=("Segoe UI", 9, "bold"))
        stat_box.pack(fill="x", pady=(0, 8))
        self.lbl_status = tk.Label(
            stat_box, text="● Idle", font=("Segoe UI", 11, "bold"),
            fg="#ffd700", bg="#1a1a2e", pady=4
        )
        self.lbl_status.pack()
        self.lbl_count = tk.Label(
            stat_box, text="Enrolled faces : 0\nMarked today   : 0",
            font=("Segoe UI", 9), fg="#ccd6f6", bg="#1a1a2e", justify="left", pady=2
        )
        self.lbl_count.pack(padx=8, anchor="w")

        # Control buttons
        btn_cfg = dict(font=("Segoe UI", 10, "bold"), width=20, pady=6, bd=0, cursor="hand2")

        self.btn_start = tk.Button(
            right, text="▶  Start Camera",
            bg="#0f3460", fg="#64ffda",
            activebackground="#16213e", activeforeground="#64ffda",
            command=self.start_camera, **btn_cfg
        )
        self.btn_start.pack(pady=3)

        self.btn_stop = tk.Button(
            right, text="■  Stop Camera",
            bg="#3d0000", fg="#ff6b6b",
            activebackground="#5a0000", activeforeground="#ff6b6b",
            command=self.stop_camera, state="disabled", **btn_cfg
        )
        self.btn_stop.pack(pady=3)

        tk.Button(
            right, text="➕  Add New Face",
            bg="#1b4332", fg="#52b788",
            activebackground="#2d6a4f", activeforeground="#52b788",
            command=self.add_face, **btn_cfg
        ).pack(pady=3)

        tk.Button(
            right, text="📋  View Attendance",
            bg="#2c2c54", fg="#a29bfe",
            activebackground="#3d3d6b", activeforeground="#a29bfe",
            command=self.view_attendance, **btn_cfg
        ).pack(pady=3)

        tk.Button(
            right, text="🔄  Reload Faces",
            bg="#2d3436", fg="#dfe6e9",
            activebackground="#3d4347", activeforeground="#dfe6e9",
            command=self._reload_faces, **btn_cfg
        ).pack(pady=3)

        # Attendance log list
        log_box = tk.LabelFrame(right, text=" Today's Log ", bg="#1a1a2e",
                                 fg="#64ffda", font=("Segoe UI", 9, "bold"))
        log_box.pack(fill="both", expand=True, pady=(8, 0))

        self.log_list = tk.Listbox(
            log_box, bg="#0d0d1a", fg="#ccd6f6",
            font=("Consolas", 9), selectbackground="#0f3460",
            height=12, bd=0, highlightthickness=0
        )
        self.log_list.pack(fill="both", expand=True, padx=4, pady=4)

        # Footer
        tk.Label(
            self.root, text="Press Q in the camera window to stop  |  Logs → Attendance.csv",
            font=("Segoe UI", 8), fg="#4a4a6a", bg="#1a1a2e"
        ).grid(row=2, column=0, columnspan=2, pady=(0, 6))

        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

    # ── FACE MANAGEMENT ──────────────────────────────────
    def _reload_faces(self):
        self.known_encodings, self.known_names = load_known_faces(IMAGES_FOLDER)
        self._update_status_label()

    def add_face(self):
        """Let the user pick an image file and register it as a new face."""
        path = filedialog.askopenfilename(
            title="Select face image",
            filetypes=[("Images", "*.jpg *.jpeg *.png *.bmp *.webp")]
        )
        if not path:
            return

        # Ask for a name
        dialog = tk.Toplevel(self.root)
        dialog.title("New Face Name")
        dialog.configure(bg="#1a1a2e")
        dialog.grab_set()

        tk.Label(dialog, text="Enter person's name:", bg="#1a1a2e",
                 fg="#ccd6f6", font=("Segoe UI", 10)).pack(padx=20, pady=(16, 4))

        name_var = tk.StringVar()
        entry = tk.Entry(dialog, textvariable=name_var, font=("Segoe UI", 11),
                         bg="#0f3460", fg="white", insertbackground="white", bd=0)
        entry.pack(padx=20, pady=4, ipady=4, fill="x")
        entry.focus()

        def confirm():
            name = name_var.get().strip()
            if not name:
                messagebox.showwarning("Name required", "Please enter a name.", parent=dialog)
                return
            # Validate face in image
            img = cv2.imread(path)
            if img is None:
                messagebox.showerror("Error", "Cannot read the selected image.", parent=dialog)
                return
            rgb  = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            encs = face_recognition.face_encodings(rgb)
            if not encs:
                messagebox.showerror("No face", "No face detected in the image.", parent=dialog)
                return
            # Copy image to folder
            os.makedirs(IMAGES_FOLDER, exist_ok=True)
            ext  = os.path.splitext(path)[1]
            dest = os.path.join(IMAGES_FOLDER, name.replace(" ", "_") + ext)
            shutil.copy2(path, dest)
            self._reload_faces()
            messagebox.showinfo("Done", f"'{name}' added successfully!", parent=dialog)
            dialog.destroy()

        tk.Button(dialog, text="Add Face", bg="#0f3460", fg="#64ffda",
                  font=("Segoe UI", 10, "bold"), bd=0, pady=6, command=confirm).pack(
            padx=20, pady=(8, 16), fill="x"
        )

    # ── CAMERA CONTROL ────────────────────────────────────
    def start_camera(self):
        if not self.known_encodings:
            messagebox.showwarning(
                "No faces enrolled",
                f"Add face images to the '{IMAGES_FOLDER}' folder first."
            )
            return
        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            messagebox.showerror("Camera Error", "Cannot open webcam.")
            return
        self.running = True
        self.btn_start.config(state="disabled")
        self.btn_stop.config(state="normal")
        self.lbl_status.config(text="● Running", fg="#52b788")
        self._thread = threading.Thread(target=self._recognition_loop, daemon=True)
        self._thread.start()

    def stop_camera(self):
        self.running = False
        if self.cap:
            self.cap.release()
            self.cap = None
        self.btn_start.config(state="normal")
        self.btn_stop.config(state="disabled")
        self.lbl_status.config(text="● Idle", fg="#ffd700")
        # Clear canvas
        self.canvas.delete("all")

    # ── RECOGNITION LOOP (background thread) ─────────────
    def _recognition_loop(self):
        while self.running:
            ret, frame = self.cap.read()
            if not ret:
                break

            if self.process_frame:
                small     = cv2.resize(frame, (0, 0), fx=FRAME_SCALE, fy=FRAME_SCALE)
                rgb_small = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
                locs      = face_recognition.face_locations(rgb_small)
                encs      = face_recognition.face_encodings(rgb_small, locs)

                names = []
                for enc in encs:
                    matches = face_recognition.compare_faces(
                        self.known_encodings, enc, tolerance=TOLERANCE
                    )
                    dists = face_recognition.face_distance(self.known_encodings, enc)
                    name  = "Unknown"
                    if len(dists) > 0:
                        idx = np.argmin(dists)
                        if matches[idx]:
                            name = self.known_names[idx]
                            if mark_attendance(name, ATTENDANCE_FILE, self.marked_today):
                                self._add_log_entry(name)
                                self._update_status_label()
                    names.append(name)

                self.face_locs  = locs
                self.face_names = names

            self.process_frame = not self.process_frame

            # Draw boxes
            scale = int(1 / FRAME_SCALE)
            for (top, right, bottom, left), name in zip(self.face_locs, self.face_names):
                colour = (80, 200, 80) if name != "Unknown" else (60, 60, 220)
                t, r, b, l = top*scale, right*scale, bottom*scale, left*scale
                cv2.rectangle(frame, (l, t), (r, b), colour, 2)
                cv2.rectangle(frame, (l, b-30), (r, b), colour, cv2.FILLED)
                cv2.putText(frame, name, (l+6, b-8),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 1)

            # Convert BGR → RGB → PIL → Tk
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_img   = Image.fromarray(rgb_frame).resize((640, 480))
            tk_img    = ImageTk.PhotoImage(pil_img)

            # Update canvas on the main thread
            self.canvas.after(0, self._update_canvas, tk_img)

        self.stop_camera()

    def _update_canvas(self, tk_img):
        self.canvas.tk_img = tk_img   # keep reference alive
        self.canvas.create_image(0, 0, anchor="nw", image=tk_img)

    # ── UI HELPERS ────────────────────────────────────────
    def _update_status_label(self):
        self.lbl_count.config(
            text=f"Enrolled faces : {len(self.known_names)}\n"
                 f"Marked today   : {len(self.marked_today)}"
        )

    def _add_log_entry(self, name):
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.log_list.insert(0, f"  ✓  {name:<20} {timestamp}")
        self.log_list.itemconfig(0, fg="#52b788")

    def view_attendance(self):
        """Open the CSV in a simple Toplevel table viewer."""
        if not os.path.isfile(ATTENDANCE_FILE):
            messagebox.showinfo("No data", "No attendance records yet.")
            return
        win = tk.Toplevel(self.root)
        win.title("Attendance Records")
        win.configure(bg="#1a1a2e")

        tree = ttk.Treeview(win, columns=("Name", "Date", "Time"), show="headings", height=20)
        for col in ("Name", "Date", "Time"):
            tree.heading(col, text=col)
            tree.column(col, width=160 if col == "Name" else 120, anchor="center")

        style = ttk.Style()
        style.theme_use("clam")
        style.configure("Treeview",
                        background="#0d0d1a", foreground="#ccd6f6",
                        fieldbackground="#0d0d1a", rowheight=24)
        style.configure("Treeview.Heading",
                        background="#0f3460", foreground="#64ffda", font=("Segoe UI", 9, "bold"))

        with open(ATTENDANCE_FILE, newline="") as f:
            reader = csv.reader(f)
            next(reader)   # skip header
            for row in reader:
                tree.insert("", "end", values=row)

        vsb = ttk.Scrollbar(win, orient="vertical", command=tree.yview)
        tree.configure(yscrollcommand=vsb.set)
        tree.pack(side="left", fill="both", expand=True)
        vsb.pack(side="right", fill="y")

    def on_close(self):
        self.stop_camera()
        self.root.destroy()


# ─────────────────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────────────────
def main():
    root = tk.Tk()
    app  = AttendanceApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
