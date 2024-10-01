---
description: Run the adapter with Node outside of Docker
---

# Running Node

We recommend using the Docker method to run the adapter from within the LibreChat Docker override file, but sometimes running the Node server yourself if essential for development.&#x20;

To do so:

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



Build and run the Coze Adapter:

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
