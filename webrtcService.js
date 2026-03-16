// src/services/webrtcService.js
// AR-Bridge — WebRTC Peer-to-Peer Video Call Service
// Handles: live video stream between operator and expert

import { db } from "./firebaseService";
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
} from "firebase/firestore";

// ─── WebRTC Config ─────────────────────────────────────────────────────────────
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    // Add TURN servers for production
    // { urls: "turn:your-turn-server.com", username: "user", credential: "pass" }
  ],
};

let peerConnection = null;
let localStream = null;
let remoteStream = null;

// ─── Camera / Media ────────────────────────────────────────────────────────────

/**
 * Start local camera stream
 * @returns {Promise<MediaStream>}
 */
export const startLocalStream = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: 1280, height: 720 },
      audio: true,
    });
    console.log("✅ Local camera started");
    return localStream;
  } catch (error) {
    console.error("❌ Camera access denied:", error.message);
    throw error;
  }
};

/**
 * Stop local camera
 */
export const stopLocalStream = () => {
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
    console.log("✅ Camera stopped");
  }
};

// ─── Call Setup ────────────────────────────────────────────────────────────────

/**
 * Operator initiates a call — creates WebRTC offer
 * @param {string} sessionId
 * @param {Function} onRemoteStream - called when expert video arrives
 * @returns {Promise<void>}
 */
export const startCall = async (sessionId, onRemoteStream) => {
  peerConnection = new RTCPeerConnection(ICE_SERVERS);
  remoteStream = new MediaStream();

  // Add local tracks to peer connection
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  // Listen for remote tracks (expert's video/audio)
  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
    onRemoteStream(remoteStream);
  };

  // Handle ICE candidates
  const callDoc = doc(db, "calls", sessionId);
  const offerCandidates = collection(callDoc, "offerCandidates");

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      addDoc(offerCandidates, event.candidate.toJSON());
    }
  };

  // Create and set offer
  const offerDescription = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };

  await setDoc(callDoc, { offer });

  // Listen for answer from expert
  onSnapshot(callDoc, (snapshot) => {
    const data = snapshot.data();
    if (!peerConnection.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      peerConnection.setRemoteDescription(answerDescription);
    }
  });

  // Listen for expert's ICE candidates
  const answerCandidates = collection(callDoc, "answerCandidates");
  onSnapshot(answerCandidates, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const candidate = new RTCIceCandidate(change.doc.data());
        peerConnection.addIceCandidate(candidate);
      }
    });
  });

  console.log("✅ Call started, waiting for expert...");
};

/**
 * Expert answers the call
 * @param {string} sessionId
 * @param {Function} onRemoteStream - called when operator video arrives
 */
export const answerCall = async (sessionId, onRemoteStream) => {
  peerConnection = new RTCPeerConnection(ICE_SERVERS);
  remoteStream = new MediaStream();

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
    onRemoteStream(remoteStream);
  };

  const callDoc = doc(db, "calls", sessionId);
  const answerCandidates = collection(callDoc, "answerCandidates");

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      addDoc(answerCandidates, event.candidate.toJSON());
    }
  };

  const callData = (await getDoc(callDoc)).data();
  const offerDescription = callData.offer;
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(offerDescription)
  );

  const answerDescription = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answerDescription);

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  await updateDoc(callDoc, { answer });

  const offerCandidates = collection(callDoc, "offerCandidates");
  onSnapshot(offerCandidates, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const candidate = new RTCIceCandidate(change.doc.data());
        peerConnection.addIceCandidate(candidate);
      }
    });
  });

  console.log("✅ Expert answered call");
};

/**
 * End call and clean up
 */
export const endCall = () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  stopLocalStream();
  console.log("✅ Call ended");
};
