import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyCSv2B3-pSl_Ncvz-F7r9mAugdwRw31Fec",
  authDomain: "todo-1f5ed.firebaseapp.com",
  projectId: "todo-1f5ed",
  storageBucket: "todo-1f5ed.firebasestorage.app",
  messagingSenderId: "1410968366",
  appId: "1:1410968366:web:fdfff95f6d7c96ce8b68bf",
  measurementId: "G-YMV54PSSV2"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
export const analytics = getAnalytics(app)
