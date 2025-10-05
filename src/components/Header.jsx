//telling nextjs this is for client rendering
"use client";
//importing react compentent useEffect
import React, { useEffect } from "react";
//importing Link from nextjs
import Link from "next/link";
//importing google's sign in, sign out and id token to see if user is logged in
import {
  signInWithGoogle,
  signOut,
  onIdTokenChanged,
} from "@/src/lib/firebase/auth.js";
//importing addFakeRestaurantsAndReviews() to create fake reviews
import { addFakeRestaurantsAndReviews } from "@/src/lib/firebase/firestore.js";
//importing cookie modifiers from nextjs
import { setCookie, deleteCookie } from "cookies-next";

function useUserSession(initialUser) {
  //use effect function from react
  useEffect(() => {
    //returning changes of user token change
    return onIdTokenChanged(async (user) => {
      //checking if user is signed in
      if (user) {
        //grabbing current token
        const idToken = await user.getIdToken();
        //setting token into cookie
        await setCookie("__session", idToken);
      } else {
        //deleting old cookie session token
        await deleteCookie("__session");
      }
      //checking if it's the same user
      if (initialUser?.uid === user?.uid) {
        return;
      }
      //refreshing window
      window.location.reload();
    });
  }, [initialUser]);
  //returning user data
  return initialUser;
}
//function exports the <Header> DOM tag for next js to render 
export default function Header({ initialUser }) {
  //grabbing user's data
  const user = useUserSession(initialUser);
  //event handler for signing out
  const handleSignOut = (event) => {
    //error checking
    event.preventDefault();
    //signing user out
    signOut();
  };
  //event handler for signing in
  const handleSignIn = (event) => {
    //error checking
    event.preventDefault();
    //sending user to google's signin
    signInWithGoogle();
  };
  //sending jsx for nextjs to render 
  return (
    <header>
      <Link href="/" className="logo">
        <img src="/friendly-eats.svg" alt="FriendlyEats" />
        Friendly Eats
      </Link>
      {user ? (
        <>
          <div className="profile">
            <p>
              <img
                className="profileImage"
                src={user.photoURL || "/profile.svg"}
                alt={user.email}
              />
              {user.displayName}
            </p>

            <div className="menu">
              ...
              <ul>
                <li>{user.displayName}</li>

                <li>
                  <a href="#" onClick={addFakeRestaurantsAndReviews}>
                    Add sample restaurants
                  </a>
                </li>

                <li>
                  <a href="#" onClick={handleSignOut}>
                    Sign Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="profile">
          <a href="#" onClick={handleSignIn}>
            <img src="/profile.svg" alt="A placeholder user image" />
            Sign In with Google
          </a>
        </div>
      )}
    </header>
  );
}
