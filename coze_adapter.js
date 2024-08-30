//#region IMPORTS AND SETUP
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Create an Express app
const app = express();
//#endregion IMPORTS AND SETUP

//#region MIDDLEWARE
// Enable CORS
app.use(cors());

// Parse JSON and URL-encoded bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
//#endregion MIDDLEWARE

//#region ENVIRONMENT VARIABLES
// Set the Coze API key, URL, and bot ID from environment variables
const COZE_API_KEY = process.env.COZE_API_KEY;
const COZE_API_URL = process.env.COZE_API_URL;
const COZE_BOT_ID = process.env.COZE_BOT_ID;
//#endregion ENVIRONMENT VARIABLES

//#region HELPER FUNCTIONS
// Escape JSON strings to prevent injection
function escapeJsonString(s) {
  return JSON.stringify(s).slice(1, -1);
}
// Upload an image to Coze
async function uploadImageToCoze(base64Image, filename) {
  try {
    // console.log('Received base64Image:', base64Image);

    // Create a buffer from the base64 data
    const buffer = Buffer.from(base64Image, 'base64');

    // Prepare form data
    const formData = new FormData();
    formData.append('file', buffer, {
      filename: filename, // Use the dynamically provided filename
      contentType: `image/${filename.split('.').pop()}`, // Set the content type based on the extension
    });

    // Configure axios request
    const response = await axios({
      method: 'POST',
      url: `${COZE_API_URL}/v1/files/upload`,
      headers: {
        Authorization: `Bearer ${COZE_API_KEY}`,
        ...formData.getHeaders(), // Include headers from formData
      },
      data: formData,
    });

    console.log('Upload successful:', response.data);
    if (response.data && response.data.code === 0) {
      return response.data.data.id; // Return file ID on success
    } else {
      throw new Error(`Failed to upload image - code: ${response.data.code}, message: ${response.data.msg}`);
    }
  } catch (error) {
    console.error(`Error uploading image to Coze: ${error.message}`);
    throw new Error('Failed to upload image');
  }
}
//#endregion HELPER FUNCTIONS

//#region API CALLS
// Make an external API call with streaming response to Coze
async function callExternalApiWithStreaming(payload, res) {
  console.debug(`Calling external API with payload: ${JSON.stringify(payload, null, 2)}`);
  try {
    const response = await axios.post(`${COZE_API_URL}/v3/chat`, payload, {
      headers: {
        'Authorization': `Bearer ${COZE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      responseType: 'stream',
      timeout: 300000, // 5 minute timeout
    });

    let buffer = '';
    response.data.on('data', (chunk) => {
      buffer += chunk.toString();
      console.log(`Buffer: ${buffer}`);
      let processBuffer = buffer.split('\n\n');
      buffer = processBuffer.pop();

      processBuffer.forEach(eventData => {
        console.log(`Event data: ${eventData}`);
        if (eventData.trim()) {
          try {
            const lines = eventData.split('\n');
            const eventLine = lines.find(l => l.startsWith('event:'));
            const dataLine = lines.find(l => l.startsWith('data:'));

            if (eventLine && dataLine) {
              const event = eventLine.substring(6).trim();
              const data = JSON.parse(dataLine.substring(5).trim());

              // Handle different event types
              switch (event) {
                case 'conversation.chat.created':
                case 'conversation.chat.in_progress':
                  // console.log(`Chat event: ${event}`);
                  break;
                case 'conversation.message.delta':
                  if (data.role === 'assistant' && data.type === 'answer') {
                    const content = escapeJsonString(data.content || '');
                    res.write(`data: {"choices": [{"delta": {"content": "${content}"}, "index": 0}]}\n\n`);
                  }
                  break;
                case 'conversation.message.completed':
                  if (data.type === 'function_call') {
                    const functionCallContent = JSON.parse(data.content || '{}');
                    const functionCall = {
                      name: functionCallContent.name || 'unknown_function',
                      arguments: JSON.stringify(functionCallContent.arguments || {}),
                    };
                    res.write(`data: {"choices": [{"delta": {"function_call": ${JSON.stringify(functionCall)}}, "index": 0}]}\n\n`);
                  } else if (data.type === 'tool_output') {
                    const toolOutput = escapeJsonString(data.content || '');
                    res.write(`data: {"choices": [{"delta": {"content": "${toolOutput}"}, "index": 0}]}\n\n`);
                  }
                  break;
                case 'conversation.chat.completed':
                  {
                    const tokenInput = data.usage?.input_count || 0;
                    const tokenOutput = data.usage?.output_count || 0;
                    const tokenTotal = data.usage?.token_count || 0;
                    console.log(`COZE TOKEN USAGE DATA: Input: ${tokenInput}, Output: ${tokenOutput}, Total: ${tokenTotal}`);
                    res.write('data: [DONE]\n\n');
                  }
                  break;
              }
            }
          } catch (error) {
            console.error(`Error processing chunk: ${error}`);
            console.error(`Problematic part: ${eventData}`);
          }
        }
      });
    });

    response.data.on('end', () => {
      if (!res.writableEnded) {
        res.end();
      }
    });

  } catch (error) {
    console.error(`Error calling external API: ${error}`);
    if (!res.writableEnded) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
}
//#endregion API CALLS

//#region ROUTES
app.post('/v1/chat/completions', async (req, res) => {
  console.log(`Received chat completion request: ${JSON.stringify(req.body)}`);
  try {
    const { messages = [], stream = true, user = 'default_user' } = req.body;
    // console.log(`Received chat completion request...MESSAGES: ${JSON.stringify(messages)}`);

    // Process messages to handle images
    for (const message of messages) {
      // console.log(`Processing message: ${JSON.stringify(message)}`);
      if (message.content && Array.isArray(message.content)) {
        for (const contentItem of message.content) {
          // console.log(`Processing content item: ${JSON.stringify(contentItem)}`);
          if (
            contentItem.type === 'image_url' &&
            contentItem.image_url &&
            contentItem.image_url.url
          ) {
            const base64Image = contentItem.image_url.url.split(',')[1];
            const mimeType = contentItem.image_url.url.match(/data:(.*?);base64,/)[1];
            const fileExtension = mimeType.split('/')[1]; // Extract the extension (e.g., jpeg, png)

            // Dynamically set the filename, assuming the original filename is unknown
            const filename = `uploaded_image.${fileExtension}`;
            // console.log(`Uploading image to Coze...BASE64 IMAGE BEFORE UPLOAD: ${base64Image}, FILENAME: ${filename}`);

            const fileId = await uploadImageToCoze(base64Image, filename);
            // console.log(`Uploaded image to Coze...FILE ID: ${fileId}`);
            contentItem.type = 'image';
            contentItem.file_id = fileId;
            delete contentItem.image_url;
          }
        }
        // console.log(`Message after processing: ${JSON.stringify(message)}`);
        // Convert the content array to a JSON string
        message.content = JSON.stringify(message.content);
        message.content_type = 'object_string';
      }
    }

    // Prepare payload for Coze API
    const cozePayload = {
      conversation_id: '1',
      bot_id: COZE_BOT_ID,
      user_id: user || 'default_user',
      additional_messages: messages,
      auto_save_history: false,
      stream: stream,
    };

    console.debug(`Coze API request payload: ${JSON.stringify(cozePayload, null, 2)}`);

    // Call external API with streaming
    await callExternalApiWithStreaming(cozePayload, res);
  } catch (error) {
    console.error(`Error in chat completion: ${error}`);
    if (!res.writableEnded) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});
//#endregion ROUTES

//#region SERVER STARTUP
const PORT = process.env.CUSTOM_PORT || 2222;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
//#endregion SERVER STARTUP