## Request
curl -X "POST" "http://localhost:2222/v1/chat/completions" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "messages": [
    {
      "content": "tell me about yourself",
      "role": "user"
    }
  ],
  "frequency_penalty": 0,
  "model": "YOUR_MODEL_NAME",
  "temperature": 1,
  "presence_penalty": 0,
  "top_p": 1,
  "user": "YOUR_USER_ID"
}'
