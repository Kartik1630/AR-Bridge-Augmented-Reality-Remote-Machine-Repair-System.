// src/services/firebaseService.js
// AR-Bridge — Firebase Backend Service
// Handles: Auth, Realtime DB, Cloud Storage, Cloud Functions

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ─── Firebase Config ───────────────────────────────────────────────────────────
// Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ─── Auth Functions ────────────────────────────────────────────────────────────

/**
 * Login user (operator or expert)
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ User logged in:", userCredential.user.uid);
    return userCredential;
  } catch (error) {
    console.error("❌ Login error:", error.message);
    throw error;
  }
};

/**
 * Register new user
 * @param {string} email
 * @param {string} password
 * @param {string} role - "operator" | "expert"
 */
export const registerUser = async (email, password, role = "operator") => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Save user profile to Firestore
    await setDoc(doc(db, "users", uid), {
      email,
      role,
      createdAt: serverTimestamp(),
    });

    console.log(`✅ User registered as ${role}:`, uid);
    return userCredential;
  } catch (error) {
    console.error("❌ Register error:", error.message);
    throw error;
  }
};

export const logoutUser = () => signOut(auth);

// ─── Session Functions ─────────────────────────────────────────────────────────

/**
 * Create a new AR repair session
 * @param {string} operatorId
 * @param {string} expertId
 * @param {string} machineType
 * @returns {Promise<string>} sessionId
 */
export const createSession = async (operatorId, expertId, machineType) => {
  try {
    const sessionRef = await addDoc(collection(db, "sessions"), {
      operatorId,
      expertId,
      machineType,
      status: "active",          // active | completed | cancelled
      startedAt: serverTimestamp(),
      arAnnotations: [],
      repairSteps: [],
    });

    console.log("✅ Session created:", sessionRef.id);
    return sessionRef.id;
  } catch (error) {
    console.error("❌ Session creation error:", error.message);
    throw error;
  }
};

/**
 * Listen to live AR annotations from expert
 * @param {string} sessionId
 * @param {Function} callback - called whenever annotations update
 */
export const listenToAnnotations = (sessionId, callback) => {
  const sessionRef = doc(db, "sessions", sessionId);
  return onSnapshot(sessionRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback(data.arAnnotations || []);
    }
  });
};

/**
 * Expert sends AR annotation to operator
 * @param {string} sessionId
 * @param {Object} annotation - { type, position, label, color }
 */
export const sendAnnotation = async (sessionId, annotation) => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    const snapshot = await getDoc(sessionRef);
    const current = snapshot.data().arAnnotations || [];

    await setDoc(
      sessionRef,
      {
        arAnnotations: [
          ...current,
          {
            ...annotation,
            timestamp: Date.now(),
            id: `ann_${Date.now()}`,
          },
        ],
      },
      { merge: true }
    );
  } catch (error) {
    console.error("❌ Annotation error:", error.message);
    throw error;
  }
};

// ─── Storage Functions ─────────────────────────────────────────────────────────

/**
 * Upload session recording to cloud storage
 * @param {string} sessionId
 * @param {Blob} videoBlob
 * @returns {Promise<string>} download URL
 */
export const uploadSessionRecording = async (sessionId, videoBlob) => {
  try {
    const storageRef = ref(storage, `recordings/${sessionId}/session.webm`);
    await uploadBytes(storageRef, videoBlob);
    const url = await getDownloadURL(storageRef);
    console.log("✅ Recording uploaded:", url);
    return url;
  } catch (error) {
    console.error("❌ Upload error:", error.message);
    throw error;
  }
};

/**
 * Upload CAD / PDF repair manual
 * @param {string} machineId
 * @param {File} file
 * @returns {Promise<string>} download URL
 */
export const uploadRepairManual = async (machineId, file) => {
  const storageRef = ref(storage, `manuals/${machineId}/${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
