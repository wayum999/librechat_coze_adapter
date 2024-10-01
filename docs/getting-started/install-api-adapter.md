---
icon: arrow-right-arrow-left
description: Finally, setting up the adapter.
---

# Install API Adapter

At this point, you should have an instance of LibreChat running and functional, and an API-accessible published Coze Chatbot with an API key associated with it.

The final step is to install the adapter itself. Power down LibreChat if you it is running using the following command from the project root:

```
docker compose down
```

## Cloning the Repository

From the LibreChat project root, clone the adapter repo using:

```
git clone https://github.com/wayum999/librechat_coze_adapter
```

#### If there are updates to the adapter, you can pull the updates to directly to your cloned folder, just make sure you keep your repos straight as nested repos can get confusing.

***

## Configuring LibreChat for the Adapter

Navigate to the `librechat_coze_adapter` folder you just cloned:

```
cd librechat_coze_adapter
```

Here you can find an /examples folder that contains the modifications you need to make to the 3 following files in your LibreChat project:

#### `.env`&#x20;

Add the environment variables to your LibreChat `.env` file as shown in the `example_env_additions` file in /examples. The variables are:\


```ruby
# Port for the Coze Adapter, default is 2222
# NOTE: must match the port in the docker-compose.override.yml file
COZE_ADAPTER_PORT=2222

# Coze API URL, default is https://api.coze.com
COZE_API_URL=https://api.coze.com

# Coze API Key (Token)
COZE_API_KEY=YOUR_COZE_API_KEY

# Coze Bot ID
COZE_BOT_ID=COZE_BOT_ID

# Coze Bot Name
COZE_BOT_NAME=YOUR_BOT_NAME
```

The ones you should change the values of are:

* COZE\_API\_KEY: found in the Coze interface runder tokens.
* COZE\_BOT\_ID: found in the URL when editing your bot.
* COZE\_BOT\_NAME: can be any name you choose to show up in the dropdown list of LibreChat

IMPORTANT: If you haven't already, for the security and safety of your site and data, ensure you replace the following variables in your .env file:

* CREDS\_KEY
* CREDS\_IV
* JWT\_SECRET
* JWT\_REFRESH\_SECRET
* MEILI\_MASTER\_KEY

LibreChat provides a useful [Credentials Generator](https://www.librechat.ai/toolkit/creds\_generator) for your convenience to create random strings for this purpose.&#x20;

NOTE: If you haven't already, ensure that DOMAIN\_CLIENT and DOMAIN\_SERVER variables are set to your custom domain if using one.

***

#### `librechat.yaml`

Next you will add the Coze endpoint to the LibreChat config file. The `librechat.yaml` file additions are shown in the `example_librechat_yaml_additions.yaml` The additions are:

```
#=================#
# ENDPOINTS       #
#=================#

endpoints:
  custom:
    - name: "Coze"  # Name of the service, can be anything custom
      baseURL: "http://host.docker.internal:${COZE_ADAPTER_PORT}/v1"  # Uses the docker host as the endpoint
      apiKey: "${COZE_API_KEY}"  # Corrected the key name to 'apiKey'
      models:
        default: ["YOUR_COZE_BOT_NAME"]  # Default bot
        fetch: false  # Fetch models not supported by Coze Adapter
      titleConvo: false  # Title conversation, recommended to be true if you have a title model like OpenAI
      titleModel: "YOUR_COZE_BOT_NAME"  # Title model
      summarize: false  # Summarize, recommended to be true if you have a summary model like OpenAI
      summaryModel: "YOUR_COZE_BOT_NAME"  # Summary model (OpenAI or similar recommended)
      forcePrompt: false  # Force prompt
      modelDisplayLabel: "Coze"  # Model display label
      userIdQuery: true  # Support user ID query
      iconURL: "https://i.imgur.com/pnEk38v.png"  # Added icon URL for the custom endpoint
```

The ones you should change the values of are:

* default: use the name you assigned the bot in the `.env` file.
* titleModel: use the name you assiged the bot in the `.env` file that you want to use for titling.
* summaryModel: use the name you assiged the bot in the `.env` file that you want to use for summaries.

***

`docker-compose.override.yml`

Finally, you will be adding the adapter as a service in your Docker Override File , `docker-compose.override.yml` , as shown in the `example_docker_override_additions.yml` file. The additions are as follows:

```
# Coze Adapter Docker Override Additions
# This file contains the additions to the LibreChat Docker override (docker-compose.override.yml) 
# to add the Coze Adapter to the LibreChat Docker container.

services:
  librechat_coze_adapter:
    container_name: librechat_coze_adapter
    build:
      context: ./librechat_coze_adapter
      dockerfile: Dockerfile.librechat_coze_adapter
    ports:
      - "${COZE_ADAPTER_PORT}:${COZE_ADAPTER_PORT}"
    environment:
      - COZE_API_KEY=${COZE_API_KEY}
      - COZE_API_URL=${COZE_API_URL}
      - COZE_ADAPTER_PORT=${COZE_ADAPTER_PORT}
      - COZE_BOT_ID=${COZE_BOT_ID}
      - COZE_BOT_NAME=${COZE_BOT_NAME}
    volumes:
      - ./librechat_coze_adapter:/app
      - ./.env:/app/.env 
    command: node coze_adapter.js
```

You may not need to make any modifications to this since it pulls the data from your`.env` file you already edited.&#x20;

***

### Adding Multiple Bots

If you add multiple bots, you will have to assign a variable for its name and its ID, and then add them both to all 3 of the files above in the appropriate places.

***

### Running Everything

If everything is set up properly, you should be able to run LibreChat normally and you should see your added service and model(s) as options.

If using Cloudflare tunneling, here is an example of a shell script you can run to set everything up and close the terminal window as it will run in the background.&#x20;

NOTE:  Be sure to change `<TUNNEL_NAME>` with the name of the tunnel you set up with Cloudflare.

```
#!/bin/bash
# Run docker compose up in the background
nohup docker compose up -d &

# Run cloudflared tunnel in the background
nohup cloudflared tunnel run <TUNNEL_NAME> &

# Ensure the script doesn't exit immediately
wait
```

After running this, you can close your terminal window and the application should continue to be accessible from the custom domain.
