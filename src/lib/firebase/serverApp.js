// enforces that this code can only be called on the server
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment
//telling nextjs this is for server side only
import "server-only";
//importing cookies to adjust cookies
import { cookies } from "next/headers";
//importing to connect to firebase
import { initializeServerApp, initializeApp } from "firebase/app";
//importing authentification 
import { getAuth } from "firebase/auth";

// Returns an authenticated client SDK instance for use in Server Side Rendering
// and Static Site Generation
export async function getAuthenticatedAppForUser() {
  const authIdToken = (await cookies()).get("__session")?.value;

  // Firebase Server App is a new feature in the JS SDK that allows you to
  // instantiate the SDK with credentials retrieved from the client & has
  // other affordances for use in server environments.
  const firebaseServerApp = initializeServerApp(
    // https://github.com/firebase/firebase-js-sdk/issues/8863#issuecomment-2751401913
    initializeApp(),
    {
      authIdToken,
    }
  );
  //authenticating
  const auth = getAuth(firebaseServerApp);
  //getting if logged in or not
  await auth.authStateReady();
//returning results
  return { firebaseServerApp, currentUser: auth.currentUser };
}
