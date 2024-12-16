import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // apiKey: "AIzaSyAU8WksJVFRoIERcc-xL_4NIwkJd6nGIJI",
  // authDomain: "smart-808aa.firebaseapp.com",
  // projectId: "smart-808aa",
  // storageBucket: "smart-808aa.firebasestorage.app",
  // messagingSenderId: "905970058229",
  // appId: "1:905970058229:web:83cb024512a81cd8e696bc",
  // measurementId: "G-1E17VH9L7C"
  apiKey: "AIzaSyCe3enV59xIfp7yhtVpAOwZsfTk9eHSTys",
  authDomain: "smart-academy-786d9.firebaseapp.com",
  projectId: "smart-academy-786d9",
  storageBucket: "smart-academy-786d9.appspot.com",
  messagingSenderId: "951424802228",
  appId: "1:951424802228:web:5274e7175d73223f8fa6e1",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
