// src/ai/machineRecognition.js
// AR-Bridge — AI Machine Recognition Engine
// Detects machine parts from camera frames using TensorFlow.js / ML Kit
// Feeds detection results into the AR Annotation Engine

import * as tf from "@tensorflow/tfjs";

// ─── Configuration ─────────────────────────────────────────────────────────────
const CONFIG = {
  MODEL_URL: "/assets/models/machine_detection/model.json", // Your trained TF.js model
  CONFIDENCE_THRESHOLD: 0.65, // Only accept detections above 65% confidence
  INPUT_SIZE: 320,             // Model input image size (320x320)
  MAX_DETECTIONS: 10,
};

// Machine part labels — extend with your own classes
export const MACHINE_LABELS = [
  "motor",
  "belt",
  "gearbox",
  "bearing",
  "valve",
  "pump",
  "sensor",
  "panel",
  "bolt",
  "pipe",
  "filter",
  "coolant_tank",
];

// ─── Machine Recognition Class ─────────────────────────────────────────────────
export class MachineRecognitionEngine {
  constructor() {
    this.model = null;
    this.isReady = false;
  }

  /**
   * Load the TensorFlow.js model
   * Replace MODEL_URL with your trained RCNN / YOLO / SSD model
   */
  async loadModel() {
    try {
      console.log("⏳ Loading machine recognition model...");
      this.model = await tf.loadGraphModel(CONFIG.MODEL_URL);
      this.isReady = true;
      console.log("✅ Machine recognition model loaded");
    } catch (error) {
      console.error("❌ Model load failed:", error.message);
      console.warn("💡 Using mock detection for development");
      this.isReady = false; // Falls back to mock
    }
  }

  /**
   * Detect machine parts in a video frame
   * @param {HTMLVideoElement | HTMLCanvasElement | ImageData} frame
   * @returns {Promise<Detection[]>}
   *
   * Each Detection: { label, confidence, bbox: { x, y, width, height } }
   */
  async detectParts(frame) {
    if (!this.isReady) {
      return this._mockDetection(); // Dev fallback
    }

    try {
      // Preprocess frame
      const tensor = tf.browser
        .fromPixels(frame)
        .resizeBilinear([CONFIG.INPUT_SIZE, CONFIG.INPUT_SIZE])
        .expandDims(0)
        .div(255.0); // Normalize to [0, 1]

      // Run inference
      const predictions = await this.model.executeAsync(tensor);
      tensor.dispose();

      // Parse predictions
      return this._parsePredictions(predictions);
    } catch (error) {
      console.error("❌ Detection error:", error.message);
      return [];
    }
  }

  /**
   * Parse raw model output into structured detections
   * Format varies by model — adjust for your specific TF.js model
   */
  _parsePredictions(predictions) {
    const [boxes, scores, classes, numDetections] = predictions;
    const numDet = numDetections.dataSync()[0];
    const boxData = boxes.dataSync();
    const scoreData = scores.dataSync();
    const classData = classes.dataSync();

    const detections = [];

    for (let i = 0; i < numDet; i++) {
      const confidence = scoreData[i];
      if (confidence < CONFIG.CONFIDENCE_THRESHOLD) continue;

      const classId = Math.round(classData[i]);
      const label = MACHINE_LABELS[classId] || `part_${classId}`;

      // Bounding box (normalized 0–1)
      const y1 = boxData[i * 4];
      const x1 = boxData[i * 4 + 1];
      const y2 = boxData[i * 4 + 2];
      const x2 = boxData[i * 4 + 3];

      detections.push({
        id: `det_${i}_${Date.now()}`,
        label,
        confidence: Math.round(confidence * 100),
        bbox: { x: x1, y: y1, width: x2 - x1, height: y2 - y1 },
      });
    }

    // Cleanup tensors
    [boxes, scores, classes, numDetections].forEach((t) => t.dispose?.());

    return detections.slice(0, CONFIG.MAX_DETECTIONS);
  }

  /**
   * OCR — Read serial number / machine label from image
   * Uses Google ML Kit in mobile app (Android/iOS)
   * This is the JS interface layer
   * @param {string} imageBase64
   * @returns {Promise<string>} extracted text
   */
  async readMachineLabel(imageBase64) {
    try {
      // On mobile (React Native / Unity): use ML Kit Text Recognition
      // On web: use Tesseract.js
      const Tesseract = await import("tesseract.js");
      const { data: { text } } = await Tesseract.recognize(imageBase64, "eng");
      return text.trim();
    } catch (error) {
      console.error("❌ OCR error:", error.message);
      return "";
    }
  }

  /**
   * Mock detection for development without a trained model
   * Returns fake detections to test the full pipeline
   */
  _mockDetection() {
    const parts = ["motor", "belt", "gearbox", "bearing"];
    const randomPart = parts[Math.floor(Math.random() * parts.length)];
    return [
      {
        id: `mock_${Date.now()}`,
        label: randomPart,
        confidence: Math.floor(70 + Math.random() * 25),
        bbox: { x: 0.3, y: 0.3, width: 0.2, height: 0.2 },
      },
    ];
  }
}

export default MachineRecognitionEngine;
