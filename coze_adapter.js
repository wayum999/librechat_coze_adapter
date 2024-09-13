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
const COZE_BOT_ID_CODEMAN = process.env.COZE_BOT_ID_CODEMAN;
//#endregion ENVIRONMENT VARIABLES

//#region HELPER FUNCTIONS
/**
 * Escape JSON strings to prevent injection.
 * @param {string} s - The string to escape.
 * @returns {string} The escaped string.
 */
function escapeJsonString(s) {
  return JSON.stringify(s).slice(1, -1);
}

/**
 * Extract the MIME type and base64 data from an image URL.
 * @param {string} imageUrl - The image URL.
 * @returns {Object} An object containing the MIME type and base64 data.
 */
function extractMimeTypeAndBase64(imageUrl) {
  const matches = imageUrl.match(/^data:(image\/[a-zA-Z0-9+]+);base64,(.*)$/);
  if (matches && matches.length === 3) {
    return { mimeType: matches[1], base64Data: matches[2] };
  } else {
    console.error('Failed to extract MIME type or base64 data. Defaulting to image/jpeg.');
    return { mimeType: 'image/jpeg', base64Data: imageUrl.split(',')[1] };
  }
}

/**
 * Upload an image to Coze.
 * @param {string} base64Image - The base64-encoded image data.
 * @param {string} mimeType - The MIME type of the image.
 * @returns {Promise<string>} A promise that resolves to the uploaded file ID.
 */
async function uploadImageToCoze(base64Image, mimeType) {
  try {
    const buffer = Buffer.from(base64Image, 'base64');
    const extension = mimeType.split('/')[1]; // Extract the extension from the MIME type
    const filename = `uploaded_image.${extension}`;

    const formData = new FormData();
    formData.append('file', buffer, {
      filename: filename,
      contentType: mimeType,
    });

    const response = await axios({
      method: 'POST',
      url: `${COZE_API_URL}/v1/files/upload`,
      headers: {
        Authorization: `Bearer ${COZE_API_KEY}`,
        ...formData.getHeaders(),
      },
      data: formData,
    });

    console.log('Upload successful:', response.data);
    if (response.data && response.data.code === 0) {
      return response.data.data.id;
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
/**
 * Make an external API call with streaming response to Coze.
 * @param {Object} payload - The payload to send to the Coze API.
 * @param {Object} res - The Express response object.
 */
async function callExternalApiWithStreaming(payload, res) {
  console.debug(`Calling external API with payload: ${JSON.stringify(payload, null, 2)}`);
  try {
    const response = await axios.post(`${COZE_API_URL}/v3/chat`, payload, {
      headers: {
        Authorization: `Bearer ${COZE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      responseType: 'stream',
      timeout: 300000, // 5 minute timeout
    });

    let buffer = '';
    response.data.on('data', (chunk) => {
      buffer += chunk.toString();
      // console.log(`Buffer: ${buffer}`);
      let processBuffer = buffer.split('\n\n');
      buffer = processBuffer.pop();

      processBuffer.forEach((eventData) => {
        console.log(`Event data: ${eventData}`);
        if (eventData.trim()) {
          try {
            const lines = eventData.split('\n');
            const eventLine = lines.find((l) => l.startsWith('event:'));
            const dataLine = lines.find((l) => l.startsWith('data:'));

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
                    res.write(
                      `data: {"choices": [{"delta": {"content": "${content}"}, "index": 0}]}\n\n`,
                    );
                  }
                  break;
                case 'conversation.message.completed':
                  if (data.type === 'function_call') {
                    const functionCallContent = JSON.parse(data.content || '{}');
                    const functionCall = {
                      name: functionCallContent.name || 'unknown_function',
                      arguments: JSON.stringify(functionCallContent.arguments || {}),
                    };
                    res.write(
                      `data: {"choices": [{"delta": {"function_call": ${JSON.stringify(
                        functionCall,
                      )}}, "index": 0}]}\n\n`,
                    );
                  } else if (data.type === 'tool_output') {
                    const toolOutput = escapeJsonString(data.content || '');
                    res.write(
                      `data: {"choices": [{"delta": {"content": "${toolOutput}"}, "index": 0}]}\n\n`,
                    );
                  }
                  break;
                case 'conversation.chat.completed':
                  {
                    const tokenInput = data.usage?.input_count || 0;
                    const tokenOutput = data.usage?.output_count || 0;
                    const tokenTotal = data.usage?.token_count || 0;
                    console.log(
                      `COZE TOKEN USAGE DATA: Input: ${tokenInput}, Output: ${tokenOutput}, Total: ${tokenTotal}`,
                    );
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
/**
 * Handle chat completion requests.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 */
app.post('/v1/chat/completions', async (req, res) => {
  console.log(`Received chat completion request: ${JSON.stringify(req.body)}`);
  try {
    const { messages = [], stream = true, user = 'default_user' } = req.body;

    // Process messages to handle images
    for (const message of messages) {
      if (message.content && Array.isArray(message.content)) {
        for (const contentItem of message.content) {
          if (
            contentItem.type === 'image_url' &&
            contentItem.image_url &&
            contentItem.image_url.url
          ) {
            try {
              const { mimeType, base64Data } = extractMimeTypeAndBase64(contentItem.image_url.url);

              console.log(`Uploading image to Coze... MIME TYPE: ${mimeType}, BASE64 IMAGE BEFORE UPLOAD: ${base64Data}`);

              const fileId = await uploadImageToCoze(base64Data, mimeType);
              console.log(`Uploaded image to Coze... FILE ID: ${fileId}`);
              contentItem.type = 'image';
              contentItem.file_id = fileId;
              delete contentItem.image_url;
            } catch (error) {
              console.error(`Error processing image upload: ${error.message}`);
            }
          }
        }
        message.content = JSON.stringify(message.content);
        message.content_type = 'object_string';
      }
    }

    // Prepare payload for Coze API
    const cozePayload = {
      conversation_id: '1',
      bot_id: COZE_BOT_ID_CODEMAN,
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
