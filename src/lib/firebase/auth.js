//importing authentification functions from firebase
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
  onIdTokenChanged as _onIdTokenChanged,
} from "firebase/auth";
//importing authentification from firebase firestore
import { auth } from "@/src/lib/firebase/clientApp";
//
export function onAuthStateChanged(cb) {
  return _onAuthStateChanged(auth, cb);
}
//changing id token
export function onIdTokenChanged(cb) {
  //returning changed id token
  return _onIdTokenChanged(auth, cb);
}
//signing in with google 
export async function signInWithGoogle() {
  //connecting to google servers 
  const provider = new GoogleAuthProvider();
//sending user to try and log in
  try {
    //authenticating
    await signInWithPopup(auth, provider);
  } catch (error) {
    //if error while trying to sign in
    console.error("Error signing in with Google", error);
  }
}
//signing out with google
export async function signOut() {
  try {
    //signing out
    return auth.signOut();
  } catch (error) {
    //if error while signing in
    console.error("Error signing out with Google", error);
  }
}
