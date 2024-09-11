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
      return NextResponse.json({ error: 'Invalid input: "text" field is required' }, { status: 400 });
    }

    // Prepare the request to LLaMA 3.1 Instruct API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, // API key for OpenRouter
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.YOUR_SITE_NAME || "Local Development"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          { role: 'system', content: systemPrompt },  // System prompt instructing the model
          { role: 'user', content: userInput }       // User input text
        ]
      }),
    });

    // Log response status
    console.log(`Response Status: ${response.status}`);

    // Check if the response is OK
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error from LLaMA API: ${errorData.message}`);
      return NextResponse.json({ error: `Error from LLaMA API: ${errorData.message}` }, { status: response.status });
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
        return NextResponse.json({ error: 'Failed to parse API response' }, { status: 500 });
      }
    } catch (err) {
      console.error('Error parsing JSON:', err);
      return NextResponse.json({ error: 'Failed to parse API response' }, { status: 500 });
    }

    // Return the flashcards as a JSON response
    return NextResponse.json({ flashcards });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'An error occurred while generating flashcards. Please try again.' }, { status: 500 });
  }
}


// POST function:
// export async function POST(req) {
//     const openai = new OpenAI() // new OpenAI client instance
//     const data = await req.text() //  extracts the text data from the request body
  
//     // We'll implement the OpenAI API call here
//     // 1. It creates a chat completion request to the OpenAI API.
//     const completion = await openai.chat.completions.create({
//     // 2. The `messages` array includes two elements:
//         messages: [
//           { role: 'system', content: systemPrompt },// — A ‘system’ message with our predefined `systemPrompt`, which instructs the AI on how to create flashcards.
//           { role: 'user', content: data },// — A ‘user’ message containing the input text from the request body.
//         ],
//         model: 'gpt-4o',// 3. We specify ‘gpt-4o’ as the model to use.
//         response_format: { type: 'json_object' },// 4. We set the `response_format` to ‘json_object’ to ensure we receive a JSON response.
//       })
    
//     // We'll process the API response in the next step
//     // Parse the JSON response from the OpenAI API
//     const flashcards = JSON.parse(completion.choices[0].message.content)    // The response is expected to be in the format specified in our system prompt, with a `flashcards` array containing objects with `front` and `back` properties.

//     // Return the flashcards as a JSON response
//     return NextResponse.json(flashcards.flashcards)
// }