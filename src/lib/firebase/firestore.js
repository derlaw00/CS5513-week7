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
//function updates the rating values and store a a review for new reviews
const updateWithRating = async (
  transaction,
  docRef,
  newRatingDocument,
  review
) => {
  //getting current restaurant data from firestore
  const restaurant = await transaction.get(docRef);
  //storing the restaurant data into variable 
  const data = restaurant.data();
  //checking if there's a new rating, if so + 1 to data.numRatings 
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;
  //checking if a new sum needs to be calculated. if so adding new rating to all of current ratings
  const newSumRating = (data?.sumRating || 0) + Number(review.rating);
  //calculating average of ratings 
  const newAverage = newSumRating / newNumRatings;
  //updating the restaurant's ratings in firebase 
  transaction.update(docRef, {
    numRatings: newNumRatings,
    sumRating: newSumRating,
    avgRating: newAverage,
  });
  //creating new review 
  transaction.set(newRatingDocument, {
    ...review,
    timestamp: Timestamp.fromDate(new Date()),
  });
};
//function adds review to restaurants
export async function addReviewToRestaurant(db, restaurantId, review) {
  //error handling. Checking for if the restaurant id was passed
        if (!restaurantId) {
                throw new Error("No restaurant ID has been provided.");
        }
  //error handling. Checking for if a review was passed
        if (!review) {
                throw new Error("A valid review has not been provided.");
        }

        try {
                //connecting to firebase and looking at current restaurant
                const docRef = doc(collection(db, "restaurants"), restaurantId);
                //looking at current restaurant's rating collection
                const newRatingDocument = doc(
                        collection(db, `restaurants/${restaurantId}/ratings`)
                );

                //updating the rating and storing the new review
                await runTransaction(db, transaction =>
                        updateWithRating(transaction, docRef, newRatingDocument, review)
                );
        } catch (error) {//checking for any errors
          //response to errors
                console.error(
                        "There was an error adding the rating to the restaurant",
                        error
                );
                throw error;
        }
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
