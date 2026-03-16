# AR-Bridge — System Architecture

## Overview

AR-Bridge connects on-site operators with remote experts using Augmented Reality.
The system is split into 3 major tiers:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AR-BRIDGE SYSTEM                            │
├──────────────────┬──────────────────────┬───────────────────────────┤
│  CLIENT (Mobile) │    CLOUD BACKEND      │  CLIENT (Expert Portal)   │
│  Operator App    │                      │  Expert Web App           │
│  Unity + ARCore  │  Firebase + WebRTC   │  React.js                 │
└──────────────────┴──────────────────────┴───────────────────────────┘
```

---

## Module Breakdown

### 1. Mobile App (Operator)
- **Framework**: Unity 2022 LTS + AR Foundation
- **AR Tracking**: ARCore (Android) / ARKit (iOS) with SLAM
- **Camera**: Live video capture + stream via WebRTC
- **AI**: TensorFlow Lite on-device for machine part detection
- **OCR**: Google ML Kit for machine label/serial reading

### 2. Expert Web Portal
- **Framework**: React.js
- **Video**: Receives WebRTC stream from operator
- **Annotation Tools**: Canvas-based drawing (arrows, highlights, labels)
- **AR Sync**: Annotations converted to 3D world coordinates and sent via Firebase

### 3. Cloud Backend
- **Firebase Firestore**: Real-time session data, annotations
- **Firebase Auth**: Role-based access (operator / expert)
- **Firebase Storage**: CAD files, PDFs, session recordings
- **Firebase Functions**: Push notifications, session cleanup
- **WebRTC + Firebase Signaling**: Peer-to-peer video call

### 4. AI Engine
- **Object Detection**: RCNN / YOLOv8 trained on industrial machine dataset
- **OCR**: Google ML Kit / Tesseract.js
- **SLAM Tracking**: Visual-Inertial Odometry (camera + IMU)
- **Future**: LSTM-based predictive maintenance

---

## Data Flow

```
[Operator Camera] 
      │
      ▼
[AR Frame Capture]
      │
      ├──▶ [TFLite AI Model] ──▶ [Part Detection] ──▶ [AR Markers on Screen]
      │
      └──▶ [WebRTC Stream] ──▶ [Firebase Signaling] ──▶ [Expert Browser]
                                                               │
                                                      [Expert Annotates]
                                                               │
                                                      [Annotation JSON]
                                                               │
                                                      [Firebase Firestore]
                                                               │
                                                      [Operator App Listener]
                                                               │
                                                      [AR Overlay Rendered]
```

---

## Database Schema (Firestore)

### Collection: `users`
```json
{
  "uid": "string",
  "email": "string",
  "role": "operator | expert",
  "createdAt": "timestamp"
}
```

### Collection: `sessions`
```json
{
  "sessionId": "string",
  "operatorId": "string",
  "expertId": "string",
  "machineType": "string",
  "status": "active | completed | cancelled",
  "startedAt": "timestamp",
  "endedAt": "timestamp",
  "arAnnotations": [
    {
      "id": "string",
      "type": "arrow | highlight | label | warning",
      "worldPosition": { "x": 0, "y": 0, "z": 0 },
      "label": "string",
      "color": "#hex",
      "timestamp": "number"
    }
  ],
  "repairSteps": ["string"]
}
```

### Collection: `calls`
```json
{
  "sessionId": "string",
  "offer": { "sdp": "string", "type": "offer" },
  "answer": { "sdp": "string", "type": "answer" }
}
```

---

## Security Rules (Firebase)

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null;
    }
    match /calls/{callId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## API Endpoints (Cloud Functions)

| Endpoint | Method | Description |
|---|---|---|
| `/createSession` | POST | Create new repair session |
| `/endSession` | POST | End session, save report |
| `/notifyExpert` | POST | Send push notification to expert |
| `/getRepairHistory` | GET | Get past sessions for operator |
| `/uploadManual` | POST | Upload CAD/PDF manual |

---

## AR Tracking Pipeline

```
Camera Frame (30fps)
      │
      ▼
Feature Extraction (ORB/SIFT keypoints)
      │
      ▼
Feature Matching (against previous frame)
      │
      ▼
Pose Estimation (camera position in 3D space)
      │
      ├── IMU Preintegration (accelerometer + gyroscope)
      │
      ▼
Visual-Inertial Odometry (VIO fusion)
      │
      ▼
Stable World Anchor → AR Overlay Placement
```

---

## Technology Justification

| Choice | Why |
|---|---|
| **Unity + AR Foundation** | Cross-platform AR (iOS + Android) with single codebase |
| **Firebase** | Real-time sync, easy WebRTC signaling, built-in auth |
| **WebRTC** | Low-latency P2P video (< 200ms), no server relay needed |
| **TensorFlow Lite** | On-device inference — works without internet |
| **SLAM** | Marker-free AR tracking — no QR codes needed |
