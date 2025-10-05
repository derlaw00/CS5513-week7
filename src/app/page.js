//importting restaurants listings
import RestaurantListings from "@/src/components/RestaurantListings.jsx";
//importing getRestraunts() function to get restraunts from database
import { getRestaurants } from "@/src/lib/firebase/firestore.js";
//importing getAuthenticatedAppForUser() function to authenticate user 
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
//importing getFirstStore() function to connect to firebase firestore 
import { getFirestore } from "firebase/firestore";

// Force next.js to treat this route as server-side rendered
// Without this line, during the build process, next.js will treat this route as static and build a static HTML file for it

export const dynamic = "force-dynamic";

// This line also forces this route to be server-side rendered
// export const revalidate = 0;

//exporting <Home> DOM to nextjs to render 
export default async function Home(props) {
  const searchParams = await props.searchParams;
  // Using seachParams which Next.js provides, allows the filtering to happen on the server-side, for example:
  // ?city=London&category=Indian&sort=Review

  //grabbing user's data after logging in to use for rendering
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  //grabbing restaurants from firebase firestore 
  const restaurants = await getRestaurants(
    getFirestore(firebaseServerApp),
    searchParams
  );
  //displaying home of logged in home page
  return (
    <main className="main__home">
      <RestaurantListings
        initialRestaurants={restaurants}
        searchParams={searchParams}
      />
    </main>
  );
}
