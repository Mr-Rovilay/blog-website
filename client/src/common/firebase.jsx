import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAXfutQJqC8CRWDpvDPjP992WQ_UUG0GUM",
  authDomain: "chelsea-blog-6c370.firebaseapp.com",
  projectId: "chelsea-blog-6c370",
  storageBucket: "chelsea-blog-6c370.appspot.com",
  messagingSenderId: "1015577103568",
  appId: "1:1015577103568:web:3142ece46febce6b08a2d5",
};

const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();
const auth = getAuth();

export const authWithGoogle = async () => {
  let user = null;
  await signInWithPopup(auth, provider)
    .then((result) => {
      user = result.user;
    })
    .catch((err) => {
      console.log(err);
    });
  return user;
};
