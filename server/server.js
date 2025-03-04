// server.js
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

// Initialize environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, problemContext } = req.body;

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });

    // Convert OpenAI format to Gemini format
    const prompt = messages[messages.length - 1].content;

    // Include conversation history if there's more than one message
    let conversationContext = "";
    if (messages.length > 1) {
      conversationContext = messages
        .slice(0, -1)
        .map(
          (msg) =>
            `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
        )
        .join("\n\n");

      if (conversationContext) {
        conversationContext =
          "Previous conversation:\n\n" + conversationContext + "\n\n";
      }
    }

    // Create system instructions to ensure the AI provides guidance rather than direct answers
    const systemInstructions = `
You are a helpful coding assistant specializing in LeetCode problems. 
Follow these guidelines when responding to users:

1. DO NOT provide complete solutions to problems.
2. Instead, guide the user with:
   - Clarifying questions about their current understanding
   - Related concepts and topics they should understand
   - General problem-solving approaches and patterns
   - Small hints that lead them in the right direction
   - Similar but simpler examples to build intuition
3. Encourage users to think through problems step-by-step
4. When asked directly for answers, remind users that you're here to help them learn
5. Use the Socratic method - ask questions that lead users to discover answers themselves
6. Provide code snippets only as examples of concepts, never as direct solutions to their problem

Remember: The goal is to help users develop their problem-solving skills, not to solve problems for them.
`;

    // Add problem context if available
    let problemInfo = "";
    if (problemContext) {
      problemInfo = `
The user is working on the following LeetCode problem:
- Title: ${problemContext.title}
- Difficulty: ${problemContext.difficulty}
- Tags: ${problemContext.tags.join(", ")}

Keep this context in mind when providing guidance, but remember not to provide the direct solution.
`;
    }

    // Generate content with the full context and instructions
    const fullPrompt =
      systemInstructions +
      problemInfo +
      conversationContext +
      "User: " +
      prompt;
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    // Format response to match OpenAI's format for frontend compatibility
    const response = {
      choices: [
        {
          message: {
            content: responseText,
          },
        },
      ],
    };

    res.json(response);
  } catch (error) {
    console.error("Gemini API Error:", error);

    // Detailed error information for debugging
    res.status(500).json({
      error: "Error processing your request",
      details: error.message,
      stack: error.stack,
    });
  }
});

// // Mock LeetCode API endpoint for development
// app.get("/api/leetcode/problem/:slug", async (req, res) => {
//   const { slug } = req.params;

//   // This is a mock implementation. In production, you would call the actual LeetCode API
//   // or your own database with problem information

//   // Sample response with mock data
//   const mockProblems = {
//     "two-sum": {
//       title: "Two Sum",
//       difficulty: "Easy",
//       tags: ["Array", "Hash Table"],
//       description:
//         "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
//     },
//     "add-two-numbers": {
//       title: "Add Two Numbers",
//       difficulty: "Medium",
//       tags: ["Linked List", "Math", "Recursion"],
//       description:
//         "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit.",
//     },
//     "median-of-two-sorted-arrays": {
//       title: "Median of Two Sorted Arrays",
//       difficulty: "Hard",
//       tags: ["Array", "Binary Search", "Divide and Conquer"],
//       description:
//         "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
//     },
//   };

//   if (mockProblems[slug]) {
//     return res.json({
//       success: true,
//       problem: mockProblems[slug],
//     });
//   }

//   // For other slugs, return a generic problem
//   res.json({
//     success: true,
//     problem: {
//       title: `Problem: ${slug.split("-").join(" ")}`,
//       difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
//       tags: ["Array", "Dynamic Programming", "Graph", "Tree"]
//         .sort(() => 0.5 - Math.random())
//         .slice(0, 2),
//       description:
//         "This is a placeholder description for development purposes.",
//     },
//   });
// });

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
