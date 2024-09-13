---
icon: toolbox
description: Installing and setting up LibreChat to work with the adapter.
---

# Install LibreChat

## Installing LibreChat

The first step is to install LibreChat either locally or on a server. The [documentation](https://www.librechat.ai/docs) is quite extensive and should complete walk through the setup process.

The adapter will utilize three main configuration components in LibreChat:

1. Docker override file \[ docker-compose.override.ym l]  [More Information >](https://www.librechat.ai/docs/configuration/docker\_override)
2. environment variables file \[ .env ]   [More Information >](https://www.librechat.ai/docs/configuration/dotenv)
3. LibreChat YAML configuration file \[ librechat.yaml ]  [More Information >](https://www.librechat.ai/docs/configuration/librechat\_yaml)

**NOTE**: This API adapter documentation assumes that LibreChat is  run via Docker. While it is certainly possible to run the adapter outside of Docker as a standalone Express Node.js application, this documentation will not go into detail for that setup. It is **strongly** recommended for a variety of reasons to use the Docker method of running the software.

[Local Installation >](https://www.librechat.ai/docs/quick\_start/local\_setup)

[Remote Installation >](https://www.librechat.ai/docs/remote)

***

### Next Steps

Once you have a LibreChat instance up and running, you can move on to the next step in the process: creating a Coze AI Chatbot. If you have one already and a Coze API key that works with it, you can skip ahead to the [adapter installation](install-api-adapter.md).
