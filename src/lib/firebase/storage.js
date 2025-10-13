//importing ref uploadBytesResumable and getDownloadURL from firebase
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
//importing storage from clientapp
import { storage } from "@/src/lib/firebase/clientApp";
//importing updateRestaurantImageReference from firestore.js
import { updateRestaurantImageReference } from "@/src/lib/firebase/firestore";
//function will update restaurant image
export async function updateRestaurantImage(restaurantId, image) {
  try {//handling for if no restaurant ID was sent
    if (!restaurantId) {
      throw new Error("No restaurant ID has been provided.");
    }
//error handling for if no image was sent
    if (!image || !image.name) {
      throw new Error("A valid image has not been provided.");
    }
    //getting new image URL and uploading to firebase
    const publicImageUrl = await uploadImage(restaurantId, image);
    //sending new image URL to updateRestaurantImageReference for it to update the url
    await updateRestaurantImageReference(restaurantId, publicImageUrl);
//returning the new url
    return publicImageUrl;
  } catch (error) {//displaying error if error
    console.error("Error processing request:", error);
  }
}
//function will upload image from user
async function uploadImage(restaurantId, image) {
  //creating new filepath for firebase
  const filePath = `images/${restaurantId}/${image.name}`;
  //storing new url just created into variable for later
  const newImageRef = ref(storage, filePath);
  //sending image user uploaded to the new url
  await uploadBytesResumable(newImageRef, image);
//sending new image url to rest of project
  return await getDownloadURL(newImageRef);
}