// import dotenv from "dotenv";
// import { TextServiceClient } from "@google-ai/generativelanguage";

// dotenv.config();

// // Load environment variables
// const API_KEY = process.env.GOOGLE_API_KEY; // Your Gemini API key
// const MODEL_NAME = "models/gemini-1.5"; // Or gemini-1.5-pro for higher reasoning

// // Initialize Gemini client
// const client = new TextServiceClient({
//   apiKey: API_KEY,
// });

// // ===============================
// // POST: Get AI Response
// // ===============================
// export const getAIResponse = async (req, res) => {
//   try {
//     const userMessage = req.body.message;

//     // Send user input to Gemini
//     const [response] = await client.generateText({
//       model: MODEL_NAME,
//       temperature: 0.7,
//       candidateCount: 1,
//       prompt: {
//         text: userMessage,
//       },
//     });

//     const aiMessage =
//       response?.candidates?.[0]?.content || "No response from AI.";

//     res.json({ aiMessage });
//   } catch (error) {
//     console.error("Error fetching AI response:", error);

//     if (error.code === 403) {
//       return res.status(403).json({
//         error:
//           "Access denied. Make sure your Gemini API key is correct and valid.",
//       });
//     }

//     if (error.code === 401) {
//       return res
//         .status(401)
//         .json({ error: "Unauthorized. Check your Google API key." });
//     }

//     res
//       .status(500)
//       .json({ error: "An error occurred while processing your request." });
//   }
// };


import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export const getAIResponse = async (req, res) => {
  try {
    const userMessage = req.body.message;

    const result = await model.generateContent(userMessage);
    const aiMessage = result.response.text();

    res.json({ aiMessage });
  } catch (error) {
    console.error("Error fetching AI response:", error);

    if (error.status === 404)
      return res
        .status(404)
        .json({ error: "Model not found. Try gemini-1.5-flash-latest or gemini-1.5-pro-latest." });

    if (error.status === 403)
      return res
        .status(403)
        .json({ error: "Access denied. Check your Gemini API key and project permissions." });

    res.status(500).json({
      error: "An error occurred while processing your request.",
      details: error.message,
    });
  }
};
  


// ===============================
// GET: Render Ask-AI Page
// ===============================
export const getAskAi = async (req, res) => {
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  try {
    const user = req.isAuthenticated() ? req.user : null;
    const role = user ? user.role : null;

    res.render("ask-ai", {
      user,
      greeting: getTimeOfDay(),
      sudo: user?.sudo || false,
      accountant: user?.accountant || false,
      manager: user?.manager || false,
      role,
      isAdmin: role === "admin",
      alert: req.query.alert,
      conversation: [],
    });
  } catch (error) {
    console.error("Error rendering Ask-AI page:", error);
    res.status(500).send("Internal Server Error");
  }
};
