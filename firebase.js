import { getFirestore } from 'firebase/firestore';
import { initializeApp } from "firebase/app";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "your key here",
  authDomain: "flashcard-saas-0000.firebaseapp.com",
  projectId: "flashcard-saas-0000",
  storageBucket: "flashcard-saas-0000.appspot.com",
  messagingSenderId: "694000097376",
  appId: "1:694900007376:web:465c306d01a5f3940000"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default db;
