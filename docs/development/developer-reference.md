---
icon: laptop-code
description: Understand the composition of the adapter to extend or customize as needed.
---

# Developer Reference

**Sometimes you may need to customize the adapter to suit your needs. The following  is an outline of its architecture and elements.**

### **Imports and Setup**

* **Modules Imported:**
  * `express`: Web framework for building RESTful APIs.
  * `axios`: Promise-based HTTP client for making API requests.
  * `cors`: Middleware to enable Cross-Origin Resource Sharing.
  * `dotenv`: Loads environment variables from a `.env` file.
  * `path` & `fileURLToPath`: Utilities for handling file paths.
  * `FormData`: Helps in constructing form data for file uploads.
* **File Path Setup:**

```javascript
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

* **Environment Variables Loading:**
  * Loads variables from a `.env` file located in the parent directory.
* **Express App Initialization:**

```javascript
const app = express();
```

### **Middleware Configuration**

* **CORS Middleware:**

```javascript
 app.use(cors());
```

* Enables all CORS requests.
* **Body Parsers:**

```javascript
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

* Parses incoming requests with JSON and URL-encoded payloads.
* Sets the payload size limit to 50MB.

### **Environment Variables**

* **API Credentials and Configuration:**

```javascript
const COZE_API_KEY = process.env.COZE_API_KEY;
const COZE_API_URL = process.env.COZE_API_URL;
const COZE_BOT_ID_CODEMAN = process.env.COZE_BOT_ID_CODEMAN;
```

* **`COZE_API_KEY`**: Authentication key for the Coze API.
* **`COZE_API_URL`**: Base URL for the Coze API endpoints.
* **`COZE_BOT_ID_CODEMAN`**: Identifier for the specific bot used in conversations.

### **Helper Functions**

* **`escapeJsonString(s)`:**
  * Escapes special characters in a string to prevent JSON injection.
  * **Purpose**: Ensures that dynamic content inserted into JSON remains valid and secure.
* **`extractMimeTypeAndBase64(imageUrl)`:**
  * Parses a data URL to extract the MIME type and base64-encoded data.
  * **Purpose**: Prepares image data for upload by separating metadata from the actual content.
* **`uploadImageToCoze(base64Image, mimeType)`:**
  * Converts base64 image data into a buffer.
  * Constructs form data with the image buffer.
  * Sends a POST request to the Coze API to upload the image.
  * Returns the `file_id` from the Coze API upon successful upload.
  * **Purpose**: Handles image uploads to the Coze API, enabling the inclusion of images in chat messages.

### **API Call Function**

* **`callExternalApiWithStreaming(payload, res)`:**
  * Sends a POST request to the Coze API's `/v3/chat` endpoint with the provided payload.
  * Configures the request to receive a streaming response (`responseType: 'stream'`).
  * Processes the streaming data in chunks, handling various event types emitted by the Coze API:
    * **`conversation.message.delta`**: Handles incremental message content from the assistant.
    * **`conversation.message.completed`**: Processes completed messages, including function calls and tool outputs.
    * **`conversation.chat.completed`**: Marks the end of the conversation and sends a `[DONE]` signal to the client.
  * Writes processed data to the client response stream in a format compatible with the client's expectations.
  * **Purpose**: Bridges the streaming responses from the Coze API to the client, maintaining real-time communication.

### **Routes**

* **`POST /v1/chat/completions` Endpoint:**

```javascript
app.post('/v1/chat/completions', async (req, res) => { ... });
```

* **Request Handling:**
  * Extracts `messages`, `stream`, and `user` from the request body.
  * Defaults:
    * `messages` to an empty array if not provided.
    * `stream` to `true`.
    * `user` to `'default_user'`.
* **Message Processing:**
  * Iterates over each message to check for image content.
  * If a message contains content items that are images encoded as data URLs, it:
    * Extracts the MIME type and base64 data.
    * Uploads the image to the Coze API using `uploadImageToCoze`.
    * Replaces the image data with a `file_id` reference in the message content.
    * Sets the `content_type` to `'object_string'` and serializes the content.
*   **Payload Construction:**

    * Builds the payload for the Coze API:

    ```javascript
    const cozePayload = {
      conversation_id: '1',
      bot_id: COZE_BOT_ID_CODEMAN,
      user_id: user || 'default_user',
      additional_messages: messages,
      auto_save_history: false,
      stream: stream,
    };
    ```

    * **Parameters:**
      * `conversation_id`: Static ID `'1'` (may need to be dynamic in a real-world scenario).
      * `bot_id`: The bot identifier from environment variables.
      * `user_id`: The user identifier from the request or default.
      * `additional_messages`: The processed messages array.
      * `auto_save_history`: Disables automatic saving of conversation history.
      * `stream`: Indicates whether to stream responses.
* **API Call Invocation:**
  * Calls `callExternalApiWithStreaming` with the constructed payload and response object.
* **Error Handling:**
  * Catches and logs errors during processing.
  * Sends a 500 Internal Server Error response if an error occurs.

### **Server Startup**

* **Port Configuration and Server Launch:**

```javascript
const PORT = process.env.CUSTOM_PORT || 2222;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

* Listens on the port specified by the `CUSTOM_PORT` environment variable or defaults to `2222`.
* Logs a message indicating the server is running.\
