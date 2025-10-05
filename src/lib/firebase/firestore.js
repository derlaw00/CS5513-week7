//importing fake reviews function
import { generateFakeRestaurantsAndReviews } from "@/src/lib/fakeRestaurants.js";

//importing functions needed to access/modify firebase 
import {
  collection,
  onSnapshot,
  query,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  Timestamp,
  runTransaction,
  where,
  addDoc,
  getFirestore,
} from "firebase/firestore";

//importing database
import { db } from "@/src/lib/firebase/clientApp";

//function updates restruant image 
export async function updateRestaurantImageReference(
  restaurantId,
  publicImageUrl
) {
  //grabbing the restaurants id from firebase
  const restaurantRef = doc(collection(db, "restaurants"), restaurantId);
  //checking if the restaurants id was obtained 
  if (restaurantRef) {
    //updating restaurants photo to provided in firebase
    await updateDoc(restaurantRef, { photo: publicImageUrl });
  }
}
//function will update rating in firebase later
const updateWithRating = async (
  transaction,
  docRef,
  newRatingDocument,
  review
) => {
  return;
};
//function will add review to restaurants later
export async function addReviewToRestaurant(db, restaurantId, review) {
  return;
}
//function adds querys to the search when user adds query 
function applyQueryFilters(q, { category, city, price, sort }) {
  //checking what category of food
  if (category) {
    q = query(q, where("category", "==", category));
  }
  //checking which city
  if (city) {
    q = query(q, where("city", "==", city));
  }
  //checking price
  if (price) {
    q = query(q, where("price", "==", price.length));
  }
  //checking rating
  if (sort === "Rating" || !sort) {
    q = query(q, orderBy("avgRating", "desc"));
  } else if (sort === "Review") {
    q = query(q, orderBy("numRatings", "desc"));
  }
  //returning query
  return q;
}
//function gets restaurants based on query
export async function getRestaurants(db = db, filters = {}) {
  //connecting to firebase and looking at restaurants
  let q = query(collection(db, "restaurants"));
  //looking for the specific queries the user selected
  q = applyQueryFilters(q, filters);
  //grabbing the data from firebase
  const results = await getDocs(q);
  //mapping the data from firebase
  return results.docs.map((doc) => {
    //returning the mapped data retrieved from firebase
    return {
      id: doc.id,
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}
//function updates restaurants whenever theres a change to restaurants
export function getRestaurantsSnapshot(cb, filters = {}) {
  //error handling
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }
  //connecting to database
  let q = query(collection(db, "restaurants"));
  //applying search queries 
  q = applyQueryFilters(q, filters);
  //sending data found
  return onSnapshot(q, (querySnapshot) => {
    //mapping data retrieved from firebase
    const results = querySnapshot.docs.map((doc) => {
      //returning mapped data
      return {
        id: doc.id,
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        timestamp: doc.data().timestamp.toDate(),
      };
    });
    //callback function to refresh
    cb(results);
  });
}
//function looks for restaurants based off id
export async function getRestaurantById(db, restaurantId) {
  //error handling checking if id provided is correct
  if (!restaurantId) {
    console.log("Error: Invalid ID received: ", restaurantId);
    return;
  }
  //connecting to database and retrieving restaurant id
  const docRef = doc(db, "restaurants", restaurantId);
  //getting the restaurant's above data
  const docSnap = await getDoc(docRef);
  //returning data found
  return {
    ...docSnap.data(),
    timestamp: docSnap.data().timestamp.toDate(),
  };
}
//function will look for restaurants based off id but refresh when new restaurant is added
export function getRestaurantSnapshotById(restaurantId, cb) {
  return;
}
//function will get reviews for specified restaurants
export async function getReviewsByRestaurantId(db, restaurantId) {
  //error handling checking if a restraunt id was sent
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }
//connecting to firebase and looking at specified restaurant's ratings
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );
//grabbing the specified restaurant's ratings
  const results = await getDocs(q);
  //mapping results
  return results.docs.map((doc) => {
    //returning what whas found
    return {
      id: doc.id,
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}
//function grabs a restaurant's rating but updates whenever there's a new restaurant added
export function getReviewsSnapshotByRestaurantId(restaurantId, cb) {
  //checking if a restaurant id was sent
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }
//connecting to firebase and looking for the restaurant's rating
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );
  //returning results whenever restaurants are updated
  return onSnapshot(q, (querySnapshot) => {
    //mapping data sent from firebase
    const results = querySnapshot.docs.map((doc) => {
      //returning mapped data
      return {
        id: doc.id,
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        timestamp: doc.data().timestamp.toDate(),
      };
    });
    //callback function for when new restaurants are added
    cb(results);
  });
}
//function adds fake restaurants and reviews to firebase
export async function addFakeRestaurantsAndReviews() {
  //generating fake restaurants and reviews
  const data = await generateFakeRestaurantsAndReviews();
  //iterating through and sending each one to firebase
  for (const { restaurantData, ratingsData } of data) {
    try {
      //creating new restaurant
      const docRef = await addDoc(
        collection(db, "restaurants"),
        restaurantData
      );
      //iterating through and adding all data for restaurant just created
      for (const ratingData of ratingsData) {
        //adding all fake data into new restaurant
        await addDoc(
          collection(db, "restaurants", docRef.id, "ratings"),
          ratingData
        );
      }
    } catch (e) {
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}
