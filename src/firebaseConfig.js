import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCe3enV59xIfp7yhtVpAOwZsfTk9eHSTys",
  authDomain: "smart-academy-786d9.firebaseapp.com",
  projectId: "smart-academy-786d9",
  storageBucket: "smart-academy-786d9.appspot.com",
  messagingSenderId: "951424802228",
  appId: "1:951424802228:web:5274e7175d73223f8fa6e1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
