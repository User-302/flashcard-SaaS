import { NextResponse } from 'next/server';

const systemPrompt = `
You are a flashcard creator, you take in text and create multiple flashcards from it. Make sure to create exactly 10 flashcards.
Both front and back should be one sentence long. Do not say anything else like "here the 10 flashcards " etc. and only output flashcards.
You should return in the following JSON format:
{
  "flashcards":[
    {
      "front": "Front of the card",
      "back": "Back of the card"
    }
  ]
}
`;

export async function POST(req) {
  try {
    // Extract the text from the request body
    const data = await req.json();
    const userInput = data.text;

    // Check if userInput is provided
    if (!userInput) {
      console.error("Invalid input: 'text' field is required.");
      return NextResponse.json(
        { error: 'Invalid input: "text" field is required' },
        { status: 400 }
      );
    }

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

    // Log response status
    console.log(`Response Status: ${response.status}`);

    // Check if the response is OK
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error from LLaMA API: ${errorData.message}`);
      return NextResponse.json(
        { error: `Error from LLaMA API: ${errorData.message}` },
        { status: response.status }
      );
    }

    // Parse the response from the API
    const result = await response.json();
    console.log('Raw response from API:', result);

    const content = result.choices[0]?.message?.content || '{}';

    // Log the content received
    console.log(`Content received from API: ${content}`);

    // Parse the JSON content to extract flashcards
    let flashcards;
    try {
      flashcards = JSON.parse(content).flashcards;
      if (!flashcards) {
        console.error('No flashcards found in the API response.');
        return NextResponse.json(
          { error: 'Failed to parse API response' },
          { status: 500 }
        );
      }
    } catch (err) {
      console.error('Error parsing JSON:', err);
      return NextResponse.json(
        { error: 'Failed to parse API response' },
        { status: 500 }
      );
    }

    // Return the flashcards as a JSON response
    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      {
        error:
          'An error occurred while generating flashcards. Please try again.',
      },
      { status: 500 }
    );
  }
}

//  In the code above, we define an async function  POST  that handles the POST request to the route. We extract the user input text from the request body and send it to the LLaMA API along with a system prompt instructing the model to generate flashcards. We then parse the response from the API to extract the flashcards and return them as a JSON response.
//  Note:  Make sure to replace  process.env.OPENROUTER_API_KEY  with your OpenRouter API key.
//  Step 4: Create the Flashcard Component
//  Next, let's create a React component to display the flashcards. Create a new file  Flashcard.js  in the  components  directory and add the following code:
