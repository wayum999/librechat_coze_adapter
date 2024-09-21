---
icon: arrow-right-arrow-left
description: Finally, setting up the adapter.
---

# Install API Adapter

At this point, you should have an instance of LibreChat running and functional, and an API-accessible published Coze Chatbot with an API key associated with it.

The final step is to install the adapter itself. There are two main routes you can take to start this process.

## Cloning the Repository

### 1. Cloning or Forking the Repository Separately

Perhaps the simplest way to keep your repos organized and separate is to clone the adapter repo in a separate project from your LibreChat repo.&#x20;

You can run this command from the location you want to store this project:

```
git clone https://github.com/wayum999/librechat_coze_adapter
```

#### You can then copy the entire `coze_adapter` folder to your LibreChat project root:

```
cp librechat_coze_adapter /path/to/your/librechat
```

#### If there are updates to the adapter, you can pull the updates to your original folder and repeat the copying process each time.

### 2. Cloning or Forking the Repository Within a LibreChat Repository

If you prefer to keep the adapter repo nested within your LibreChat application, you can simply clone the repo from the root of your project.

You can then run this command from the root:

```
git clone https://github.com/wayum999/librechat_coze_adapter
```

#### If there are updates to the adapter, you can pull the updates to directly to your cloned folder, just make sure you keep your repos straight as nested repos can get confusing.

***

## Configuring the Adapter

Navigate to the `librechat_coze_adapter` folder you just cloned:

```
cd librechat_coze_adapter
```

Here you can find the following folders and documents to guide you with the setup:

***

## Configuring LibreChat



It sets up an Express server that listens for requests from LibreChat and forwards them to the Coze API. It translates the OpenAI-compatible API requests to the Coze API requests and vice versa.

The simplest setup is to integrate it with an existing LibreChat Docker Compose setup and is recommended.

### Installation

1. Add the environment variables to your LibreChat `.env` file as shown in the `example_env_additions` file.
2. Add the Coze Adapter to your LibreChat `librechat.yaml` file as shown in the `example_librechat_yaml_additions.yaml` file.
3. Add the Coze Adapter to your Docker Override File `docker-compose.override.yml` as shown in the `example_docker_override_additions.yml` file.
4.  Build and run the Coze Adapter:

    #### Using Docker (recommended)



    Navigate to the coze\_adapter folder:\


    ```
    cd coze_adapter
    ```

    \
    Build the Coze Adapter Docker image:\


    ```
    sh run_docker_build_coze_adapter.sh
    ```

    \
    or\


    ```
    docker compose build coze_adapter
    ```

    \
    Then head back to your root and run your LibreChat Docker Compose as you normally would.

    #### Running Locally (without Docker)

    \
    Navigate to the coze\_adapter folder:\


    ```
    cd coze_adapter
    ```

    \
    Install the dependencies:\


    ```
    npm install
    ```

    \
    Start the Coze Adapter on port 2222 by default:\


    ```
    npm run start
    ```

    \
    or\


    ```
    node coze_adapter.js
    ```

    \
    Then run your local LibreChat server as you would normally do.

### Usage

Once installed and running, you can use the Coze Adapter as a custom API in LibreChat. Refer to the LibreChat documentation for instructions on how to configure and use custom APIs in your chat application.
