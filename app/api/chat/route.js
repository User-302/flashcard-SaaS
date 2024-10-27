import { auth } from "@clerk/nextjs/server";
import { db } from "../../lib/firebase";
import { collection, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// Define your system prompt for the AI model.
const systemPrompt = "You are an intelligent and friendly assistant.";

export async function POST(req) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      );
    }

    // Parse request body
    const { messages } = await req.json();
    if (!messages || !messages.length) {
      return new Response(
        JSON.stringify({ error: "No messages provided" }), 
        { status: 400 }
      );
    }

    // Get the latest user message
    const latestMessage = messages[messages.length - 1].content;

    // Get AI response using a real API call
    const responseContent = await getAIResponse(latestMessage);

    // Fetch existing chat document or create one
    const userDocRef = doc(collection(db, "chatHistory"), userId);
    const userDocSnap = await getDoc(userDocRef);

    let chatHistory = [];
    if (userDocSnap.exists()) {
      chatHistory = userDocSnap.data().messageHistory || [];
    }

    // Append the new messages and AI response to chat history
    chatHistory.push({ role: 'user', content: latestMessage });
    chatHistory.push({ role: 'assistant', content: responseContent });

    // Create or update chat document
    const chatDoc = {
      userId,
      messageHistory: chatHistory,
      lastUpdated: serverTimestamp(),
    };

    // Save the updated chat history to Firestore
    await setDoc(userDocRef, chatDoc);

    // Return response to client
    return new Response(
      JSON.stringify({ 
        content: responseContent,
        timestamp: new Date().toISOString()
      }), 
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal Server Error",
        details: error.message 
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

async function getAIResponse(userInput) {
  try {
    // Prepare the request to LLaMA 3.1 Instruct API
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, // API key for OpenRouter
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.YOUR_SITE_URL || 'http://localhost:3000',
          'X-Title': process.env.YOUR_SITE_NAME || 'Local Development',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            { role: 'system', content: systemPrompt }, // System prompt instructing the model
            { role: 'user', content: userInput }, // User input text
          ],
        }),
      }
    );

    // Check if the response is OK
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error from LLaMA API: ${errorData.message}`);
      return "I'm having trouble processing your request. Please try again later.";
    }

    // Parse the response from the API
    const result = await response.json();
    const content = result.choices[0]?.message?.content || "Sorry, I couldn't understand your question.";

    // Return the generated response content
    return content;
  } catch (error) {
    console.error('Error:', error);
    return "An error occurred while generating a response. Please try again later.";
  }
}
