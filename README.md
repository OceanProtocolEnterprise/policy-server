# Policy Server

Policy Server implementation.

## Quick Start

To get the Policy Server up and running in a Docker container:

## ENV Example
```
AUTH_TYPE = "waltid"
WALTID_VERIFIER_URL="https://verifier.portal.walt.id"
DEFAULT_VP_POLICIES=["expired","signature","revoked_status_list"]
DEFAULT_VC_POLICIES=["expired","signature","revoked_status_list"]
```
1. Start the Docker container:

   ```bash
   npm run start:docker

2. Access the API Documentation

[http://localhost:8000/api-docs](http://localhost:8000/api-docs)
