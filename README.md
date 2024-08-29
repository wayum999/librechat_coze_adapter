# Coze LibreChat Adapter

This adapter allows the Coze low-code agent platform to be used as a custom API in the LibreChat chat application. 

It sets up an Express server that listens for requests from LibreChat and forwards them to the Coze API. It translates the OpenAI-compatible API requests to the Coze API requests and vice versa.

The simplest setup is to integrate it with an existing LibreChat Docker Compose setup and is recommended.

## Installation

1. Copy the contents of the `coze_adapter` folder into the root of your LibreChat installation.

2. Add the environment variables to your LibreChat `.env` file as shown in the `example_env_additions` file.

3. Add the Coze Adapter to your LibreChat `librechat.yaml` file as shown in the `example_librechat_yaml_additions.yaml` file.

4. Add the Coze Adapter to your Docker Override File `docker-compose.override.yml` as shown in the `example_docker_override_additions.yml` file.

5. Build and run the Coze Adapter:

   ### Using Docker (recommended)

   Navigate to the coze_adapter folder:
   ```
   cd coze_adapter
   ```

   Build the Coze Adapter Docker image:
   ```
   sh run_docker_build_coze_adapter.sh
   ```
   or
   ```
   docker compose build coze_adapter
   ```
   Then head back to your root and run your LibreChat Docker Compose as you normally would.

   ### Running Locally (without Docker)

   Navigate to the coze_adapter folder:
   ```
   cd coze_adapter
   ```

   Install the dependencies:
   ```
   npm install
   ```

   Start the Coze Adapter on port 2222 by default:
   ```
   npm run start
   ```
   or
   ```
   node coze_adapter.js
   ```
   Then run your local LibreChat server as you would normally do.

## Usage

Once installed and running, you can use the Coze Adapter as a custom API in LibreChat. Refer to the LibreChat documentation for instructions on how to configure and use custom APIs in your chat application.
