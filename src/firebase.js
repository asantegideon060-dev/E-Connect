import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCKYi8pMOtBpmx-60YjScROpcAqfm2HfBg",
  authDomain: "econnect-gh.firebaseapp.com",
  projectId: "econnect-gh",
  storageBucket: "econnect-gh.firebasestorage.app",
  messagingSenderId: "200487048952",
  appId: "1:200487048952:web:f170c8c679321749a60d0d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
