// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBfl_9yK-3HT9foovz15pJ2ov5FpuSMZ2U',
  authDomain: 'docgenerator-85a2e.firebaseapp.com',
  projectId: 'docgenerator-85a2e',
  storageBucket: 'docgenerator-85a2e.firebasestorage.app',
  messagingSenderId: '149419757453',
  appId: '1:149419757453:web:7b8256aa00924599f777c4',
  measurementId: 'G-H042B1HSE2',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
