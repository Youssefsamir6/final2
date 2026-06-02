"""
Smart Access Camera Client
A camera application that captures images at the entrance gate
and sends them to the backend for face recognition.
"""

import cv2
import requests
import json
import base64
import time
import sys
import os
from datetime import datetime
from pathlib import Path

# Configuration
class Config:
    """Configuration for the camera client"""
    # Backend API URL
    API_URL = os.getenv("API_URL", "http://localhost:3000")
    API_KEY = os.getenv("DEVICE_API_KEY", "dev-key-123")
    
    # Camera settings
    CAMERA_INDEX = int(os.getenv("CAMERA_INDEX", "0"))
    FRAME_WIDTH = int(os.getenv("FRAME_WIDTH", "640"))
    FRAME_HEIGHT = int(os.getenv("FRAME_HEIGHT", "480"))
    
    # Device settings
    DEVICE_ID = os.getenv("DEVICE_ID", "cam-main-gate")
    GATE_NAME = os.getenv("GATE_NAME", "Main Gate")
    
    # Recognition settings
    CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.6"))
    
    # Capture settings
    CAPTURE_INTERVAL = float(os.getenv("CAPTURE_INTERVAL", "2.0"))  # seconds between captures
    MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))
    
    # Display settings
    SHOW_PREVIEW = os.getenv("SHOW_PREVIEW", "true").lower() == "true"
    
    # Save captured images
    SAVE_IMAGES = os.getenv("SAVE_IMAGES", "false").lower() == "true"
    SAVE_DIR = os.getenv("SAVE_DIR", "./captured_images")


class CameraClient:
    """Camera client for face recognition access control"""
    
    def __init__(self, config=None):
        self.config = config or Config()
        self.camera = None
        self.running = False
        self.last_capture_time = 0
        self.recognition_results = []
        
        # Create save directory if needed
        if self.config.SAVE_IMAGES:
            Path(self.config.SAVE_DIR).mkdir(parents=True, exist_ok=True)
    
    def initialize_camera(self):
        """Initialize the camera"""
        try:
            self.camera = cv2.VideoCapture(self.config.CAMERA_INDEX)
            if not self.camera.isOpened():
                print(f"❌ Failed to open camera {self.config.CAMERA_INDEX}")
                return False
            
            self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, self.config.FRAME_WIDTH)
            self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, self.config.FRAME_HEIGHT)
            print(f"✅ Camera initialized: {self.config.FRAME_WIDTH}x{self.config.FRAME_HEIGHT}")
            return True
        except Exception as e:
            print(f"❌ Camera initialization error: {e}")
            return False
    
    def capture_frame(self):
        """Capture a frame from the camera"""
        if self.camera is None or not self.camera.isOpened():
            return None
        
        ret, frame = self.camera.read()
        if not ret:
            return None
        
        return frame
    
    def frame_to_base64(self, frame):
        """Convert a frame to base64 encoded string"""
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        return base64.b64encode(buffer).decode('utf-8')
    
    def save_image(self, frame, prefix="capture"):
        """Save a captured frame to disk"""
        if not self.config.SAVE_IMAGES:
            return None
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{prefix}_{timestamp}.jpg"
        filepath = os.path.join(self.config.SAVE_DIR, filename)
        cv2.imwrite(filepath, frame)
        return filepath
    
    def recognize_face(self, image_base64):
        """Send image to backend for face recognition"""
        url = f"{self.config.API_URL}/api/ai/device/smart-access"
        
        headers = {
            "X-API-Key": self.config.API_KEY
        }
        
        data = {
            "image": image_base64,
            "deviceId": self.config.DEVICE_ID,
            "gateName": self.config.GATE_NAME
        }
        
        for attempt in range(self.config.MAX_RETRIES):
            try:
                response = requests.post(url, json=data, headers=headers, timeout=30)
                response.raise_for_status()
                return response.json()
            except requests.exceptions.ConnectionError:
                print(f"⚠️  Connection failed (attempt {attempt + 1}/{self.config.MAX_RETRIES})")
                time.sleep(2)
            except requests.exceptions.Timeout:
                print(f"⚠️  Request timeout (attempt {attempt + 1}/{self.config.MAX_RETRIES})")
                time.sleep(2)
            except Exception as e:
                print(f"❌ Recognition error: {e}")
                return None
        
        print("❌ All retry attempts failed")
        return None
    
    def process_recognition_result(self, result, frame):
        """Process the recognition result and display/update status"""
        if result is None:
            status = "ERROR"
            message = "Recognition failed"
            color = (0, 0, 255)  # Red
        else:
            status = result.get("status", "unknown")
            confidence = result.get("confidence", 0)
            user_id = result.get("userId")
            message = f"ID: {user_id} | Conf: {confidence:.2f}"
            
            if status == "authorized":
                color = (0, 255, 0)  # Green
            else:
                color = (0, 0, 255)  # Red
        
        # Add status overlay to frame
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, 0), (frame.shape[1], 60), color, -1)
        cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
        
        cv2.putText(frame, f"Status: {status.upper()}", (10, 25),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(frame, message[:50], (10, 50),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Store result
        self.recognition_results.append({
            "timestamp": datetime.now().isoformat(),
            "status": status,
            "result": result
        })
        
        # Keep only last 100 results
        if len(self.recognition_results) > 100:
            self.recognition_results = self.recognition_results[-100:]
        
        return status, message
    
    def draw_status_panel(self, frame):
        """Draw a status panel showing recent activity"""
        panel_x = frame.shape[1] - 250
        panel_y = 10
        
        # Background
        cv2.rectangle(frame, (panel_x, panel_y), (frame.shape[1] - 5, panel_y + 150),
                     (40, 40, 40), -1)
        cv2.rectangle(frame, (panel_x, panel_y), (frame.shape[1] - 5, panel_y + 150),
                     (100, 100, 100), 1)
        
        # Title
        cv2.putText(frame, "Recent Activity", (panel_x + 5, panel_y + 20),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Recent results
        for i, result in enumerate(reversed(self.recognition_results[-5:])):
            y = panel_y + 40 + (i * 20)
            status = result.get("status", "unknown")
            color = (0, 255, 0) if status == "authorized" else (0, 0, 255)
            cv2.circle(frame, (panel_x + 15, y - 5), 5, color, -1)
            cv2.putText(frame, status[:8], (panel_x + 25, y),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
    
    def run_preview(self):
        """Run the camera preview with face recognition"""
        print("\n" + "=" * 50)
        print("🎥 Smart Access Camera Client")
        print("=" * 50)
        print(f"📍 Gate: {self.config.GATE_NAME}")
        print(f"📷 Device: {self.config.DEVICE_ID}")
        print(f"🌐 API: {self.config.API_URL}")
        print(f"⏱️  Capture interval: {self.config.CAPTURE_INTERVAL}s")
        print("=" * 50)
        print("Press 'q' to quit, 'c' to capture manually\n")
        
        if not self.initialize_camera():
            return
        
        self.running = True
        
        while self.running:
            frame = self.capture_frame()
            if frame is None:
                print("❌ Failed to capture frame")
                time.sleep(1)
                continue
            
            current_time = time.time()
            
            # Auto-capture based on interval
            if current_time - self.last_capture_time >= self.config.CAPTURE_INTERVAL:
                # Save image if enabled
                if self.config.SAVE_IMAGES:
                    self.save_image(frame, "before_recognition")
                
                # Convert and recognize
                image_base64 = self.frame_to_base64(frame)
                print("🔍 Recognizing face...")
                
                result = self.recognize_face(image_base64)
                status, message = self.process_recognition_result(result, frame)
                
                print(f"  Status: {status} | {message}")
                
                # Save result image if enabled
                if self.config.SAVE_IMAGES and result:
                    self.save_image(frame, f"result_{status}")
                
                self.last_capture_time = current_time
            
            # Draw status panel
            self.draw_status_panel(frame)
            
            # Add timestamp
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cv2.putText(frame, timestamp, (10, frame.shape[0] - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
            
            # Show preview if enabled
            if self.config.SHOW_PREVIEW:
                cv2.imshow("Smart Access - Press 'q' to quit, 'c' to capture", frame)
                
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    self.running = False
                elif key == ord('c'):
                    # Manual capture
                    image_base64 = self.frame_to_base64(frame)
                    result = self.recognize_face(image_base64)
                    status, message = self.process_recognition_result(result, frame)
                    print(f"📸 Manual capture: {status} | {message}")
                    self.last_capture_time = current_time
        
        self.cleanup()
    
    def capture_single(self):
        """Capture a single image and recognize"""
        if not self.initialize_camera():
            return None
        
        # Warm up camera
        for _ in range(10):
            self.capture_frame()
            time.sleep(0.1)
        
        frame = self.capture_frame()
        if frame is None:
            print("❌ Failed to capture frame")
            return None
        
        # Save if enabled
        if self.config.SAVE_IMAGES:
            filepath = self.save_image(frame, "single_capture")
            print(f"💾 Saved: {filepath}")
        
        # Recognize
        image_base64 = self.frame_to_base64(frame)
        result = self.recognize_face(image_base64)
        
        self.cleanup()
        return result
    
    def cleanup(self):
        """Clean up resources"""
        self.running = False
        if self.camera is not None:
            self.camera.release()
        cv2.destroyAllWindows()
        print("\n✅ Camera client stopped")
    
    def test_connection(self):
        """Test connection to the backend"""
        try:
            response = requests.get(f"{self.config.API_URL}/health", timeout=5)
            if response.status_code == 200:
                print("✅ Backend connection successful")
                return True
            else:
                print(f"⚠️  Backend returned status {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Cannot connect to backend: {e}")
            return False


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Smart Access Camera Client")
    parser.add_argument("--preview", action="store_true", help="Run with camera preview")
    parser.add_argument("--single", action="store_true", help="Capture single image and exit")
    parser.add_argument("--test", action="store_true", help="Test backend connection")
    parser.add_argument("--camera", type=int, help="Camera index (default: 0)")
    parser.add_argument("--api-url", type=str, help="Backend API URL")
    parser.add_argument("--device-id", type=str, help="Device ID")
    parser.add_argument("--gate", type=str, help="Gate name")
    
    args = parser.parse_args()
    
    config = Config()
    
    # Override config with command line args
    if args.camera is not None:
        config.CAMERA_INDEX = args.camera
    if args.api_url:
        config.API_URL = args.api_url
    if args.device_id:
        config.DEVICE_ID = args.device_id
    if args.gate:
        config.GATE_NAME = args.gate
    
    client = CameraClient(config)
    
    if args.test:
        client.test_connection()
    elif args.single:
        result = client.capture_single()
        if result:
            print(f"\nResult: {json.dumps(result, indent=2)}")
    else:
        # Default: run with preview
        client.run_preview()


if __name__ == "__main__":
    main()