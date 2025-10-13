"use client";
//telling next.js this is for the client side of the app
// This components handles the review dialog and uses a next.js feature known as Server Actions to handle the form submission
//importing useEffect, useLaoutEffect and useRef from react
import { useEffect, useLayoutEffect, useRef } from "react";
//importing RatingPicker component from RatingPicker.jsx
import RatingPicker from "@/src/components/RatingPicker.jsx";
//importing handleReviewFormSubmission from actions.js
import { handleReviewFormSubmission } from "@/src/app/actions.js";
//reviewDialog function will handle the displaying the forms for new reviews
const ReviewDialog = ({
  isOpen,
  handleClose,
  review,
  onChange,
  userId,
  id,
}) => {
  //calling useRef from react and storing it into dailog
  const dialog = useRef();

  // dialogs only render their backdrop when called with `showModal`
  //calling useLayoutEffect to update the client side when form is requested
  useLayoutEffect(() => {
    //checking if form background is open
    if (isOpen) {
      //if so update and display the form
      dialog.current.showModal();
    } else {
      //if not closing
      dialog.current.close();
    }
    //sending to react to update
  }, [isOpen, dialog]);
//allowing users to close the form by clicking to the side
  const handleClick = (e) => {
    // close if clicked outside the modal
    if (e.target === dialog.current) {
      handleClose();
    }
  };

  return (
    <dialog ref={dialog} onMouseDown={handleClick}>
      <form //calling handleReviewFormSubmission when clicked
        action={handleReviewFormSubmission}
                onSubmit={() => {
          handleClose();//closing form
        }}>
        <header>
          <h3>Add your review</h3>
        </header>
        <article>
          <RatingPicker />

          <p>
            <input
              type="text"
              name="text"
              id="review"
              placeholder="Write your thoughts here"
              required
              value={review.text}
              onChange={(e) => onChange(e.target.value, "text")}
            />
          </p>

          <input type="hidden" name="restaurantId" value={id} />
          <input type="hidden" name="userId" value={userId} />
        </article>
        <footer>
          <menu>
            <button
              autoFocus
              type="reset"
              onClick={handleClose}
              className="button--cancel"
            >
              Cancel
            </button>
            <button type="submit" value="confirm" className="button--confirm">
              Submit
            </button>
          </menu>
        </footer>
      </form>
    </dialog>
  );
};
//exporting reviewDialog for rest of components to see
export default ReviewDialog;
