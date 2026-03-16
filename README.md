# 🔧 AR-Bridge — Augmented Reality Remote Repair System

> **Scan. Connect. Repair — From Anywhere in the World.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-blue)]()
[![AR](https://img.shields.io/badge/AR-ARCore%20%7C%20ARKit-green)]()
[![Status](https://img.shields.io/badge/Status-Research%20%2F%20Patent%20Stage-orange)]()
[![Made with](https://img.shields.io/badge/Made%20with-Unity%20%7C%20Firebase%20%7C%20WebRTC-purple)]()

---

## 📌 What is AR-Bridge?

**AR-Bridge** is an **Augmented Reality-powered remote machine repair system** that allows on-site technicians to connect with remote experts in real time. The expert sees what the technician sees through a live video stream and overlays AR annotations — arrows, labels, highlights — directly onto the machine in the technician's view.

No more guessing. No more expensive expert travel. Just point, scan, and get guided step-by-step.

---

## 🎯 Problem Statement

- Machines break down in remote or inaccessible locations
- Skilled engineers are not always on-site
- Regular video calls (Zoom/Teams) cannot provide **spatially accurate guidance**
- Downtime costs industries thousands of dollars per hour

---

## 💡 Our Solution

AR-Bridge bridges the gap between **on-site operators** and **remote experts** using:

| Feature | Description |
|---|---|
| 📷 Live Video Streaming | Real-time camera feed from operator to expert |
| 🤖 AI Machine Recognition | Detects machine parts using computer vision (RCNN + OCR) |
| 🎯 AR Overlays | Expert annotations appear on the machine in 3D space |
| ☁️ Cloud Backend | Firebase real-time database + cloud storage |
| 🔐 Secure Communication | Encrypted peer-to-peer video via WebRTC |
| 🧠 Predictive Maintenance | AI flags potential failures before they happen *(future)* |

---

## 🏗️ System Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   OPERATOR       │ ──────▶ │   CLOUD PLATFORM  │ ◀────── │   EXPERT         │
│  (Mobile App)    │         │                  │         │  (Web Portal)    │
│                 │         │  • Firebase DB   │         │                 │
│  • AR Camera    │ ◀─────── │  • Cloud Storage │ ──────▶ │  • Annotations  │
│  • SLAM Track   │         │  • Auth Service  │         │  • Video Feed   │
│  • AR Overlay   │         │  • AI Engine     │         │  • AR Drawing   │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

**Data Flow:**
```
Operator Camera → Video Stream → Cloud AI → Part Detection
      ↓                                          ↓
AR Overlay ← Expert Annotations ← Expert Interface
```

---

## 🧩 Key Modules

### 1. 📱 Mobile Application (Operator Side)
- Built with **Unity + ARCore/ARKit**
- Real-time SLAM tracking for AR anchor placement
- OCR-based machine part recognition
- WebRTC peer-to-peer video call

### 2. 🖥️ Web Portal (Expert Side)
- Browser-based expert dashboard
- Draw AR arrows, labels, highlights on live video
- Session history and AR instruction library
- Multi-expert collaboration support

### 3. ☁️ Cloud Backend
- **Firebase** — Real-time database, authentication, cloud functions
- **Cloud Storage** — CAD files, PDFs, video recordings
- **WebRTC** — Low-latency peer-to-peer video

### 4. 🤖 AI/ML Engine
- **Object Detection**: RCNN for machine part identification
- **OCR**: Machine-Learning Kit for serial number/label recognition
- **Visual Odometry**: IMU + Camera fusion (SLAM) for stable AR tracking

---

## 📁 Project Structure

```
ar-bridge/
│
├── src/
│   ├── screens/          # App UI screens (Login, Scan, AR, Report)
│   ├── components/       # Reusable UI components
│   ├── ar/               # AR tracking, overlay, SLAM modules
│   ├── ai/               # Machine recognition, OCR, object detection
│   └── services/         # Firebase, WebRTC, API services
│
├── assets/
│   ├── images/           # UI images and icons
│   ├── models/           # 3D models for AR overlays
│   └── icons/            # App icons
│
├── docs/
│   ├── architecture.md   # Detailed system architecture
│   ├── api.md            # API documentation
│   └── diagrams/         # System diagrams (patent-grade)
│
├── tests/                # Unit and integration tests
├── README.md
└── LICENSE
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| AR Engine | Unity, ARCore (Android), ARKit (iOS) |
| AI / CV | TensorFlow Lite, OpenCV, ML Kit |
| Backend | Firebase (Firestore, Auth, Functions) |
| Video | WebRTC, Socket.io |
| Frontend | React.js (Expert Portal) |
| 3D Models | Blender, GLTF format |
| Tracking | SLAM, Visual-Inertial Odometry |

---

## 🔄 Repair Workflow

```
1. 📱 Open AR-Bridge App
2. 🔐 Login (Operator / Expert)
3. 📷 Point camera at broken machine
4. 🤖 AI detects machine & parts automatically
5. 📡 Connect to remote expert
6. 👁️ Expert sees live video feed
7. ✏️ Expert draws AR annotations
8. 🎯 Annotations appear on machine in AR
9. 🔧 Operator follows step-by-step repair
10. ✅ Repair complete — report generated
```

---

## 📊 Research & Patent Status

- ✅ System Architecture Designed
- ✅ Patent Diagrams Prepared (10 diagrams)
- ✅ Algorithm Documented
- 🔄 Prototype Development — *In Progress*
- 🔄 IEEE Paper Draft — *In Progress*
- ⏳ Patent Filing — *Planned*

---

## 🚀 Future Features

- 🧠 **AI Predictive Maintenance** — predict machine failure before it happens
- 🖐️ **Gesture Control** — hands-free repair guidance
- 🗣️ **Voice Commands** — "Next step", "Highlight bolt"
- 👤 **3D Hologram Expert** — full body hologram of remote technician
- 🌐 **Multi-language AR** — instructions in any language

---

## 👨‍💻 Kartik Shinde*
UG/PG Student | AR Systems Researcher
📧 shindekartik41@gmailcom
🔗www.linkedin.com/in/kartik-s-37b968260/ (https://github.com/Kartik1630)

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

> *"The future of repair is not sending an expert to the machine — it's sending the expert's knowledge to whoever is at the machine."*
