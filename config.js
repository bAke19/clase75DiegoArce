// Import the functions you need from the SDKs you need
import firebase from "firebase";
require("@firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyB1hCyEefPP5mEy51s25kkzGgwF_yQyKec",
  authDomain: "e-library-e8c9c.firebaseapp.com",
  projectId: "e-library-e8c9c",
  storageBucket: "e-library-e8c9c.appspot.com",
  messagingSenderId: "242154945059",
  appId: "1:242154945059:web:b8f44454f00de07abf4f96"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase.firestore();