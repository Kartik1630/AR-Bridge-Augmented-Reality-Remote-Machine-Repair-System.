// src/ar/arAnnotationEngine.js
// AR-Bridge — AR Annotation Engine
// Converts expert annotations into 3D AR overlays on operator's screen
// Uses: Three.js / ARCore / ARKit depending on platform

// ─── Annotation Types ──────────────────────────────────────────────────────────
export const ANNOTATION_TYPES = {
  ARROW: "arrow",       // Directional arrow pointing to a part
  HIGHLIGHT: "highlight", // Glowing circle around a component
  LABEL: "label",       // Text label floating over a part
  PATH: "path",         // Step-by-step path (e.g., follow this cable)
  WARNING: "warning",   // Red warning indicator
};

// ─── Annotation Colors ─────────────────────────────────────────────────────────
export const ANNOTATION_COLORS = {
  PRIMARY: "#00FF88",   // Green — normal instruction
  WARNING: "#FF4444",   // Red — caution / danger
  INFO: "#4488FF",      // Blue — informational
  HIGHLIGHT: "#FFD700", // Gold — important part
};

// ─── AR Annotation Engine Class ────────────────────────────────────────────────
export class ARAnnotationEngine {
  constructor(arSession) {
    this.arSession = arSession;     // ARCore / ARKit session
    this.annotations = new Map();   // Active annotations keyed by id
    this.scene = null;              // Three.js scene
  }

  /**
   * Initialize the AR scene
   * @param {HTMLCanvasElement} canvas
   */
  init(canvas) {
    // In a real Unity/ARCore app this would be native code
    // This JS version demonstrates the logic for a WebAR prototype
    console.log("✅ AR Annotation Engine initialized");
    this.canvas = canvas;
  }

  /**
   * Add an annotation received from expert
   * @param {Object} annotation
   * @param {string} annotation.id
   * @param {string} annotation.type - ANNOTATION_TYPES
   * @param {{ x: number, y: number, z: number }} annotation.worldPosition - 3D anchor
   * @param {string} annotation.label - text to display
   * @param {string} annotation.color - hex color
   */
  addAnnotation(annotation) {
    const { id, type, worldPosition, label, color } = annotation;

    if (this.annotations.has(id)) {
      this.updateAnnotation(id, annotation);
      return;
    }

    let arObject;
    switch (type) {
      case ANNOTATION_TYPES.ARROW:
        arObject = this._createArrow(worldPosition, color);
        break;
      case ANNOTATION_TYPES.HIGHLIGHT:
        arObject = this._createHighlight(worldPosition, color);
        break;
      case ANNOTATION_TYPES.LABEL:
        arObject = this._createLabel(worldPosition, label, color);
        break;
      case ANNOTATION_TYPES.WARNING:
        arObject = this._createWarning(worldPosition);
        break;
      default:
        console.warn("Unknown annotation type:", type);
        return;
    }

    this.annotations.set(id, { ...annotation, arObject });
    console.log(`✅ Annotation added: [${type}] "${label}" at`, worldPosition);
  }

  /**
   * Remove a specific annotation
   * @param {string} id
   */
  removeAnnotation(id) {
    const annotation = this.annotations.get(id);
    if (annotation) {
      // Remove from AR scene
      if (annotation.arObject) {
        annotation.arObject.destroy?.();
      }
      this.annotations.delete(id);
      console.log("✅ Annotation removed:", id);
    }
  }

  /**
   * Clear all annotations (e.g., start new repair step)
   */
  clearAll() {
    this.annotations.forEach((_, id) => this.removeAnnotation(id));
    console.log("✅ All annotations cleared");
  }

  /**
   * Update annotation (e.g., move arrow to new position)
   */
  updateAnnotation(id, newData) {
    const existing = this.annotations.get(id);
    if (existing) {
      this.removeAnnotation(id);
      this.addAnnotation({ ...existing, ...newData });
    }
  }

  // ─── Private Creators ────────────────────────────────────────────────────────

  _createArrow(position, color = ANNOTATION_COLORS.PRIMARY) {
    // Unity C# equivalent:
    // GameObject arrow = Instantiate(arrowPrefab, position, Quaternion.identity);
    // arrow.GetComponent<Renderer>().material.color = Color.green;
    return {
      type: "arrow",
      position,
      color,
      destroy: () => console.log("Arrow removed from scene"),
    };
  }

  _createHighlight(position, color = ANNOTATION_COLORS.HIGHLIGHT) {
    return {
      type: "highlight",
      position,
      color,
      animation: "pulse", // Pulsing glow effect
      destroy: () => console.log("Highlight removed from scene"),
    };
  }

  _createLabel(position, text, color = ANNOTATION_COLORS.INFO) {
    return {
      type: "label",
      position,
      text,
      color,
      billboard: true,  // Label always faces camera
      destroy: () => console.log("Label removed from scene"),
    };
  }

  _createWarning(position) {
    return {
      type: "warning",
      position,
      color: ANNOTATION_COLORS.WARNING,
      icon: "⚠️",
      animation: "blink",
      destroy: () => console.log("Warning removed from scene"),
    };
  }

  /**
   * Convert 2D screen tap to 3D world position using AR raycasting
   * @param {{ x: number, y: number }} screenPoint
   * @returns {{ x: number, y: number, z: number } | null}
   */
  screenToWorldPosition(screenPoint) {
    // ARCore equivalent:
    // Frame.Raycast(screenPoint.x, screenPoint.y, out hit)
    // return hit.Pose.position
    console.log("Raycasting from screen point:", screenPoint);
    return { x: 0, y: 0, z: -0.5 }; // Placeholder — real implementation needs native AR
  }

  /**
   * Get all current annotations as JSON (for saving to Firebase)
   */
  exportAnnotations() {
    const result = [];
    this.annotations.forEach((ann) => {
      result.push({
        id: ann.id,
        type: ann.type,
        worldPosition: ann.worldPosition,
        label: ann.label,
        color: ann.color,
      });
    });
    return result;
  }
}

export default ARAnnotationEngine;
