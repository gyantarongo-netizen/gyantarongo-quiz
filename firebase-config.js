import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmDmmDOx0d87MJsKnV2l7NAJ1w_PXrDj8",
  authDomain: "gyan-tarongo.firebaseapp.com",
  projectId: "gyan-tarongo",
  storageBucket: "gyan-tarongo.firebasestorage.app",
  messagingSenderId: "696790243936",
  appId: "1:696790243936:web:a3fe99553d0eb831d68105",
  measurementId: "G-DD99D4TR60"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
