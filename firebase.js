import { getFirestore } from 'firebase/firestore';
import { initializeApp } from "firebase/app";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDj4aWJEhtRgL_CRVFmo_ztL0CHF8_XrMg",
  authDomain: "flashcard-saas-f94e5.firebaseapp.com",
  projectId: "flashcard-saas-f94e5",
  storageBucket: "flashcard-saas-f94e5.appspot.com",
  messagingSenderId: "694960597376",
  appId: "1:694960597376:web:465c306d01a5f394f53965"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default db;