"""
╔══════════════════════════════════════════════════════════╗
║        FACE RECOGNITION ATTENDANCE SYSTEM                ║
║        Built with OpenCV + face_recognition              ║
╚══════════════════════════════════════════════════════════╝

Author  : AI-Powered Python Project
Version : 1.0
Requires: opencv-python, face_recognition, numpy
"""

import cv2
import face_recognition
import numpy as np
import os
import csv
from datetime import datetime


# ─────────────────────────────────────────────
#  CONFIGURATION
# ─────────────────────────────────────────────
IMAGES_FOLDER   = "ImagesAttendance"   # Folder with known face images
ATTENDANCE_FILE = "Attendance.csv"     # Output CSV file
FRAME_SCALE     = 0.25                 # Resize factor for speed (0.25 = 25%)
TOLERANCE       = 0.50                 # Face match tolerance (lower = stricter)
FONT            = cv2.FONT_HERSHEY_SIMPLEX


# ─────────────────────────────────────────────
#  STEP 1 – LOAD & ENCODE KNOWN FACES
# ─────────────────────────────────────────────
def load_known_faces(folder: str) -> tuple[list, list]:
    """
    Scan the images folder, encode every face found, and return
    two parallel lists: known_encodings and known_names.

    Supported formats: .jpg  .jpeg  .png  .bmp  .webp
    File naming rule : The filename (without extension) becomes
                       the person's display name.
                       Example: "John_Doe.jpg" → "John Doe"
    """
    known_encodings: list = []
    known_names:     list = []

    if not os.path.isdir(folder):
        print(f"[ERROR] Images folder '{folder}' not found.")
        print(f"        Create the folder and add face photos, then retry.")
        return known_encodings, known_names

    supported = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    image_files = [
        f for f in os.listdir(folder)
        if os.path.splitext(f)[1].lower() in supported
    ]

    if not image_files:
        print(f"[WARNING] No supported images found in '{folder}'.")
        return known_encodings, known_names

    print(f"\n[INFO] Loading {len(image_files)} image(s) from '{folder}' …\n")

    for filename in image_files:
        path = os.path.join(folder, filename)
        name = os.path.splitext(filename)[0].replace("_", " ").replace("-", " ")

        img = cv2.imread(path)
        if img is None:
            print(f"  [SKIP] Cannot read '{filename}'.")
            continue

        # face_recognition expects RGB; OpenCV loads BGR
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encodings = face_recognition.face_encodings(rgb)

        if not encodings:
            print(f"  [SKIP] No face detected in '{filename}'.")
            continue

        # Use the first face found in the image
        known_encodings.append(encodings[0])
        known_names.append(name)
        print(f"  [OK]   Encoded face for → {name}")

    print(f"\n[INFO] {len(known_names)} face(s) ready for recognition.\n")
    return known_encodings, known_names


# ─────────────────────────────────────────────
#  STEP 2 – ATTENDANCE CSV HELPERS
# ─────────────────────────────────────────────
def initialize_csv(filepath: str) -> None:
    """Create the CSV with a header row if it doesn't exist yet."""
    if not os.path.isfile(filepath):
        with open(filepath, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["Name", "Date", "Time"])
        print(f"[INFO] Created attendance file → {filepath}")


def mark_attendance(name: str, filepath: str, marked_today: set) -> None:
    """
    Append one row to the CSV for the recognised person.
    Skips if the person was already marked in this session.
    """
    if name in marked_today:
        return  # Already recorded – skip duplicate

    now  = datetime.now()
    date = now.strftime("%Y-%m-%d")
    time = now.strftime("%H:%M:%S")

    with open(filepath, "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([name, date, time])

    marked_today.add(name)
    print(f"[ATTENDANCE] ✓  {name}  |  {date}  {time}")


# ─────────────────────────────────────────────
#  STEP 3 – DRAW OVERLAY ON FRAME
# ─────────────────────────────────────────────
def draw_face_box(
    frame:      np.ndarray,
    top: int, right: int, bottom: int, left: int,
    name:       str,
    is_known:   bool,
) -> None:
    """
    Draw a coloured bounding box and name label around a detected face.
    Green = recognised  |  Red = unknown
    """
    colour = (0, 200, 80) if is_known else (0, 60, 220)
    label  = name if is_known else "Unknown"

    # Box
    cv2.rectangle(frame, (left, top), (right, bottom), colour, 2)

    # Filled label background
    cv2.rectangle(frame, (left, bottom - 30), (right, bottom), colour, cv2.FILLED)

    # Name text
    cv2.putText(
        frame, label,
        (left + 6, bottom - 8),
        FONT, 0.65, (255, 255, 255), 1,
    )


# ─────────────────────────────────────────────
#  STEP 4 – MAIN RECOGNITION LOOP
# ─────────────────────────────────────────────
def run_attendance_system(
    known_encodings: list,
    known_names:     list,
    attendance_file: str,
) -> None:
    """
    Open the webcam and run face recognition frame-by-frame.

    Performance tricks
    ──────────────────
    • Frames are scaled down to FRAME_SCALE before detection.
    • Face detection only runs on every other frame (process_this_frame).
    • Drawing always uses the full-resolution frame.
    """
    cap = cv2.VideoCapture(0)   # 0 = default webcam
    if not cap.isOpened():
        print("[ERROR] Cannot open webcam. Check your camera connection.")
        return

    marked_today:        set   = set()      # Names already logged this session
    face_locations_cur:  list  = []         # Locations from last processed frame
    face_names_cur:      list  = []         # Names    from last processed frame
    process_this_frame:  bool  = True       # Toggle – skip every other frame

    print("\n[INFO] Webcam started.  Press  Q  to quit.\n")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("[ERROR] Failed to capture frame. Exiting …")
            break

        # ── Process every other frame for speed ──────────────────────────
        if process_this_frame:
            # Shrink frame → faster detection
            small = cv2.resize(frame, (0, 0), fx=FRAME_SCALE, fy=FRAME_SCALE)
            rgb_small = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)

            # Detect all face bounding boxes in the small frame
            face_locations_cur = face_recognition.face_locations(rgb_small)

            # Encode detected faces
            face_encodings_cur = face_recognition.face_encodings(
                rgb_small, face_locations_cur
            )

            face_names_cur = []

            for face_encoding in face_encodings_cur:
                # Compare against every known face
                matches   = face_recognition.compare_faces(
                    known_encodings, face_encoding, tolerance=TOLERANCE
                )
                face_dist = face_recognition.face_distance(
                    known_encodings, face_encoding
                )

                name = "Unknown"

                if len(face_dist) > 0:
                    best_idx = np.argmin(face_dist)   # Closest match
                    if matches[best_idx]:
                        name = known_names[best_idx]
                        # Mark attendance on first recognition
                        mark_attendance(name, attendance_file, marked_today)

                face_names_cur.append(name)

        process_this_frame = not process_this_frame   # Toggle

        # ── Draw results on full-resolution frame ────────────────────────
        scale = int(1 / FRAME_SCALE)   # Convert small coords → full coords

        for (top, right, bottom, left), name in zip(
            face_locations_cur, face_names_cur
        ):
            draw_face_box(
                frame,
                top    * scale,
                right  * scale,
                bottom * scale,
                left   * scale,
                name,
                is_known=(name != "Unknown"),
            )

        # ── Status bar at the top of the window ─────────────────────────
        cv2.rectangle(frame, (0, 0), (frame.shape[1], 32), (30, 30, 30), cv2.FILLED)
        status = (
            f"Recognised today: {len(marked_today)}  |  "
            f"Press Q to quit"
        )
        cv2.putText(frame, status, (10, 22), FONT, 0.55, (220, 220, 220), 1)

        cv2.imshow("Face Recognition Attendance System", frame)

        # Press Q (or q) to stop
        if cv2.waitKey(1) & 0xFF == ord("q"):
            print("\n[INFO] Q pressed – shutting down …")
            break

    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    print(f"\n[DONE] Session ended.  Attendance saved to '{attendance_file}'.\n")


# ─────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────
def main() -> None:
    print("=" * 58)
    print("   FACE RECOGNITION ATTENDANCE SYSTEM  v1.0")
    print("=" * 58)

    # 1. Load and encode all known faces
    known_encodings, known_names = load_known_faces(IMAGES_FOLDER)

    if not known_encodings:
        print("\n[ERROR] No encodings loaded. Add images and restart.\n")
        return

    # 2. Prepare the attendance CSV
    initialize_csv(ATTENDANCE_FILE)

    # 3. Start the real-time recognition loop
    run_attendance_system(known_encodings, known_names, ATTENDANCE_FILE)


if __name__ == "__main__":
    main()
