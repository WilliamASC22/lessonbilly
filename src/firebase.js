import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase Console > Project settings > Your apps > Web app > SDK setup
// Replace every value below with YOUR Firebase web app configuration.
// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAmnSlRybfQbMIocl92uy3-mYZxKKVPz4",
  authDomain: "lessonbilly-8380e.firebaseapp.com",
  projectId: "lessonbilly-8380e",
  storageBucket: "lessonbilly-8380e.firebasestorage.app",
  messagingSenderId: "1056872991796",
  appId: "1:1056872991796:web:490c8ea7e6a37f0c588e61"
};


// After signing up as the tutor, copy your UID from Firebase Authentication.
// Put the same UID here AND in the Firestore security rules.
export const TUTOR_UID = "Yw2zbZef0lWUnq85M9hgGyBjpPj2";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
