import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyBu4MmzwuEywR-UGEP7tViOykKMjfmJzZk",
    authDomain: "ins-clone-react-927bf.firebaseapp.com",
    projectId: "ins-clone-react-927bf",
    storageBucket: "ins-clone-react-927bf.appspot.com",
    messagingSenderId: "854495411963",
    appId: "1:854495411963:web:4b31c95d608b901a9aba5e",
    measurementId: "G-FDQFLLQPGQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage();

export { db, auth, storage, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, serverTimestamp, ref, uploadBytesResumable, getDownloadURL };