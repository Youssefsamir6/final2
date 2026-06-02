# Smart Access Camera Client

A camera application that captures images at the entrance gate and sends them to the backend for face recognition and access control.

## Features

- 🎥 Real-time camera capture with preview
- 🔍 Automatic face recognition via backend API
- 📸 Manual capture mode
- 💾 Optional image saving for logging
- 🔄 Auto-retry on connection failures
- 📊 On-screen status display
- ⌨️ Keyboard controls (q=quit, c=capture)

## Installation

### Prerequisites
- Python 3.8+
- Camera (webcam or USB camera)
- Backend server running

### Setup

```bash
# Navigate to camera client directory
cd smart-access-backend/camera-client

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings
```

## Usage

### Run with Camera Preview (Default)
```bash
python camera_client.py --preview
```

This will:
- Open the camera with a live preview
- Automatically capture and recognize faces every 2 seconds
- Display status overlay on the video feed
- Show recent activity panel

### Capture Single Image
```bash
python camera_client.py --single
```

### Test Backend Connection
```bash
python camera_client.py --test
```

### Command Line Options

| Option | Description |
|--------|-------------|
| `--preview` | Run with camera preview (default) |
| `--single` | Capture single image and exit |
| `--test` | Test backend connection |
| `--camera <index>` | Camera index (default: 0) |
| `--api-url <url>` | Backend API URL |
| `--device-id <id>` | Device ID |
| `--gate <name>` | Gate name |

### Examples

```bash
# Use camera 1 instead of default 0
python camera_client.py --camera 1

# Connect to remote backend
python camera_client.py --api-url http://192.168.1.100:3000

# Set custom device and gate
python camera_client.py --device-id entrance-cam-1 --gate "Building A Entrance"
```

## Configuration

Edit the `.env` file to customize:

| Variable | Description | Default |
|----------|-------------|---------|
| `API_URL` | Backend API URL | `http://localhost:3000` |
| `DEVICE_API_KEY` | API key for device authentication | `dev-key-123` |
| `CAMERA_INDEX` | Camera device index | `0` |
| `FRAME_WIDTH` | Camera frame width | `640` |
| `FRAME_HEIGHT` | Camera frame height | `480` |
| `DEVICE_ID` | Unique device identifier | `cam-main-gate` |
| `GATE_NAME` | Gate/display name | `Main Gate` |
| `CAPTURE_INTERVAL` | Seconds between auto-captures | `2.0` |
| `SHOW_PREVIEW` | Show camera preview window | `true` |
| `SAVE_IMAGES` | Save captured images to disk | `false` |
| `SAVE_DIR` | Directory to save images | `./captured_images` |

## Keyboard Controls

When running with preview:

| Key | Action |
|-----|--------|
| `q` | Quit the application |
| `c` | Manual capture (trigger recognition immediately) |

## Output Format

The recognition result from the backend:

```json
{
  "status": "authorized",
  "userId": 123,
  "confidence": 0.95,
  "message": "Access granted"
}
```

## Integration with Smart Access System

The camera client communicates with the backend via:

```
POST /api/ai/device/smart-access
Headers: X-API-Key: <device-api-key>
Body: {
  "image": "<base64-encoded-jpg>",
  "deviceId": "<device-id>",
  "gateName": "<gate-name>"
}
```

## Troubleshooting

### Camera not found
- Check camera index: `python camera_client.py --camera 1` (or higher)
- Ensure camera is connected and not used by another application

### Connection refused
- Ensure backend server is running: `http://localhost:3000`
- Check API_URL in .env matches your backend

### Recognition always fails
- Verify AI worker is running
- Check backend logs for errors
- Ensure face database has enrolled users

### Preview window not showing
- Set `SHOW_PREVIEW=false` in .env for headless operation
- On servers without display, use `--single` mode

## Running in Production

For 24/7 operation at an entrance gate:

### Linux (systemd service)
```ini
# /etc/systemd/system/smart-access-camera.service
[Unit]
Description=Smart Access Camera Client
After=network.target

[Service]
Type=simple
User=smartaccess
WorkingDirectory=/path/to/smart-access-backend/camera-client
ExecStart=/usr/bin/python3 camera_client.py --preview
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Windows (Task Scheduler)
Create a scheduled task that runs on startup:
- Program: `python.exe`
- Arguments: `camera_client.py --preview`
- Start in: `C:\path\to\smart-access-backend\camera-client`

## License

Proprietary - Smart Access System