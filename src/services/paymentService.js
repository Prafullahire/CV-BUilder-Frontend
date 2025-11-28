// import { loadStripe } from "@stripe/stripe-js";

// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// export const makePayment = async (cvId, action) => {
//   const res = await fetch(`${import.meta.env.VITE_API_URL}/payment/create-checkout-session`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ cvId, action }),
//   });

//   const data = await res.json();

//   if (!data.url) throw new Error("Stripe session not created");

//   const stripe = await stripePromise;
//   await stripe.redirectToCheckout({ sessionId: data.id || data.url });
// };
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL; // use env variable

export const makePayment = async (cvId, action) => {
  const response = await axios.post(`${API_URL}/payment/create-checkout-session`, {
    cvId,
    action,
  });
  return response.data;
};

