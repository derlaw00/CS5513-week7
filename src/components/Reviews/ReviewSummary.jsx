//importing gemini20Flash and googleAI from googleai
import { gemini20Flash, googleAI } from "@genkit-ai/googleai";
//importing genkit from genkit
import { genkit } from "genkit";
//impoerinbg getReviewsByRestaurantID from firestore.js
import { getReviewsByRestaurantId } from "@/src/lib/firebase/firestore.js";
//importing getAuthenticatedAppForUser from serverapp.js
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";
//importing getFirestore from firestore
import { getFirestore } from "firebase/firestore";
//function will call Gemini's api to send a prompt asking it to summarize all the ratings from a specific restaurant
export async function GeminiSummary({ restaurantId }) {
  //connecting to firebase
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  //getting reviews from the restaurant that was requested
  const reviews = await getReviewsByRestaurantId(
    getFirestore(firebaseServerApp),
    restaurantId
  );
//creating a char to seperate reviews for gemini
  const reviewSeparator = "@";
  //creating the prompt
  const prompt = `
    Based on the following restaurant reviews, 
    where each review is separated by a '${reviewSeparator}' character, 
    create a one-sentence summary of what people think of the restaurant. 

    Here are the reviews: ${reviews.map((review) => review.text).join(reviewSeparator)}
  `;

  try {
    if (!process.env.GEMINI_API_KEY) {
      // Make sure GEMINI_API_KEY environment variable is set:
      // https://firebase.google.com/docs/genkit/get-started
      throw new Error(
        'GEMINI_API_KEY not set. Set it with "firebase apphosting:secrets:set GEMINI_API_KEY"'
      );
    }

    // Configure a Genkit instance.
    const ai = genkit({
      plugins: [googleAI()],
      model: gemini20Flash, // set default model
    });
    const { text } = await ai.generate(prompt);//sending prompt to gemi and storing the results
//sending the text results to nextjs to be displayed on the client
    return (
      <div className="restaurant__review_summary">
        <p>{text}</p>
        <p>✨ Summarized with Gemini</p>
      </div>
    );
  } catch (e) {//checking for error if something went wrong
    console.error(e);
    return <p>Error summarizing reviews.</p>;
  }
}
//displaying which AI was used to summarize
export function GeminiSummarySkeleton() {
  //sending to next js
  return (
    <div className="restaurant__review_summary">
      <p>✨ Summarizing reviews with Gemini...</p>
    </div>
  );
}
