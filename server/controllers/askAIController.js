import dotenv from "dotenv";
import { VertexAI } from "@google-cloud/vertexai";

dotenv.config();

// Load environment variables
const PROJECT_ID = process.env.PROJECT_ID;
const LOCATION = process.env.LOCATION || "us-central1";

// Initialize Vertex AI client
const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
const model = "gemini-1.5-flash"; // You can use gemini-1.5-pro for higher reasoning

// ===============================
// POST: Get AI Response
// ===============================
export const getAIResponse = async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Get the generative model instance
    const generativeModel = vertexAI.getGenerativeModel({ model });

    // Send user input to Gemini
    const response = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
    });

    const aiMessage =
      response?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI.";

    res.json({ aiMessage });
  } catch (error) {
    console.error("Error fetching AI response:", error);

    if (error.code === 403) {
      return res.status(403).json({
        error:
          "Access denied. Make sure your Vertex AI API is enabled and credentials are correct.",
      });
    }

    if (error.code === 401) {
      return res
        .status(401)
        .json({ error: "Unauthorized. Check your Google credentials." });
    }

    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
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
