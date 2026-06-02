import cv2
import requests
import base64
import time
import os
import json
from datetime import datetime
import threading

# Config
BACKEND_URL = os.environ.get('BACKEND_URL', 'http://localhost:3000')
AI_URL = os.environ.get('AI_URL', 'http://localhost:5000')
DEVICE_ID = os.environ.get('DEVICE_ID', 'cam-main-gate')
GATE_NAME = os.environ.get('GATE_NAME', 'Main Gate')
API_KEY = os.environ.get('API_KEY', 'dev-key-123')
CAMERA_ID = int(os.environ.get('CAMERA_ID', 0))
INTERVAL = float(os.environ.get('INTERVAL', 2.0))  # seconds

def capture_and_recognize():
  cap = cv2.VideoCapture(CAMERA_ID)
  if not cap.isOpened():
    print(f"Error: Cannot open camera {CAMERA_ID}")
    return
  
  print(f"Camera worker started: {DEVICE_ID} @ {GATE_NAME}")
  
  while True:
    ret, frame = cap.read()
    if not ret:
      print("Failed to grab frame")
      time.sleep(INTERVAL)
      continue
    
    # Encode frame to base64 JPEG
    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
    img_b64 = base64.b64encode(buffer).decode('utf-8')
    
    # Send to backend AI endpoint
    payload = {
      'image': f'data:image/jpeg;base64,{img_b64}',
      'deviceId': DEVICE_ID,
      'gateName': GATE_NAME,
      'timestamp': datetime.now().isoformat()
    }
    
    headers = {'X-API-Key': API_KEY}
    
    try:
      response = requests.post(
        f'{BACKEND_URL}/api/ai/device/smart-access',
        json=payload,
        headers=headers,
        timeout=5
      )
      
      if response.status_code == 200:
        result = response.json()
        status = result.get('access', {}).get('status', 'unknown')
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {status} - conf: {result.get('decision', {}).get('confidence', 0):.2f}")
      else:
        print(f"API error: {response.status_code}")
        
    except Exception as e:
      print(f"Request failed: {e}")
    
    time.sleep(INTERVAL)
  
  cap.release()

if __name__ == '__main__':
  # Daemon mode
  thread = threading.Thread(target=capture_and_recognize, daemon=True)
  thread.start()
  
  print("Camera worker running. Ctrl+C to stop.")
  try:
    while True:
      time.sleep(1)
  except KeyboardInterrupt:
    print("Stopping...")

