"use client";
//telling NextJS this is a client component in the app

// This components shows one individual restaurant
// It receives data from src/app/restaurant/[id]/page.jsx
//importing react, useState, useEffect, Suspense from React
import { React, useState, useEffect, Suspense } from "react";
//importing dynamic from nextjs
import dynamic from "next/dynamic";
//importing getRestaurantSnapshotById from firestore.js
import { getRestaurantSnapshotById } from "@/src/lib/firebase/firestore.js";
//importing getUser from getUser.js
import { useUser } from "@/src/lib/getUser";
//importing RestaurantDetails from restaurantDetails.jsx
import RestaurantDetails from "@/src/components/RestaurantDetails.jsx";
//importing updateRestaurantImage from storage.js
import { updateRestaurantImage } from "@/src/lib/firebase/storage.js";
//storing ReviewDialog DOM component using dynamic from nextjs
const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx"));
//function is creating the Restraunt DOM component
export default function Restaurant({
  id,
  initialRestaurant,
  initialUserId,
  children,
}) {
  //using useState from react to update restaurant details in real time
  const [restaurantDetails, setRestaurantDetails] = useState(initialRestaurant);
  //using useState from react to update isOpen in real time
  const [isOpen, setIsOpen] = useState(false);

  // The only reason this component needs to know the user ID is to associate a review with the user, and to know whether to show the review dialog
  const userId = useUser()?.uid || initialUserId;//checking if a user is logged in or else shove in default user
  //using useState from react to update the review when the reviews are updated
  const [review, setReview] = useState({
    rating: 0,
    text: "",
  });
//function will insert the reviews on change
  const onChange = (value, name) => {
    //setting the review and name of user who put review
    setReview({ ...review, [name]: value });
  };
//function will check for new restaurants images users have uploaded
  async function handleRestaurantImage(target) {
    //checking if a new image was sent
    const image = target.files ? target.files[0] : null;
    //if no image leave function
    if (!image) {
      return;
    }
//getting new image url path by calling updateRestaurantImage and sending the restaurant ID and new image
    const imageURL = await updateRestaurantImage(id, image);
    //calling setRestaurantDetails that was created earlier with useState and sending restrautDetails and new photo
    setRestaurantDetails({ ...restaurantDetails, photo: imageURL });
  }
//function will handle closing of forms 
  const handleClose = () => {
    //setting isOpen to fall
    setIsOpen(false);
    //senting user's review with default values if not filled
    setReview({ rating: 0, text: "" });
  };
//checking for when a changed has been made
  useEffect(() => {
    //returning the new data to update the page on since this is client side
    return getRestaurantSnapshotById(id, (data) => {
      setRestaurantDetails(data);
    });
  }, [id]);

  return (
    <>
      <RestaurantDetails
        restaurant={restaurantDetails}
        userId={userId}
        handleRestaurantImage={handleRestaurantImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        {children}
      </RestaurantDetails>
      {userId && (
        <Suspense fallback={<p>Loading...</p>}>
          <ReviewDialog
            isOpen={isOpen}
            handleClose={handleClose}
            review={review}
            onChange={onChange}
            userId={userId}
            id={id}
          />
        </Suspense>
      )}
    </>
  );
}
