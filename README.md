# Policy Server

Policy Server implementation.

## Quick Start

To get the Policy Server up and running in a Docker container:

## ENV Example
```
AUTH_TYPE = "waltid"
WALTID_VERIFIER_URL="https://verifier.portal.walt.id"
WALTID_SUCCESS_REDIRECT_URL="https://example.com/success?id=$id"
DEFAULT_VP_POLICIES=["expired","signature","revoked-status-list"]
DEFAULT_VC_POLICIES=["expired","signature","revoked-status-list"]
```
1. Start the Docker container:

   ```bash
   npm run start:docker

2. Access the API Documentation

[http://localhost:8000/api-docs](http://localhost:8000/api-docs)

**Actions**

- `initiate`
- `getPD`
- `presentationRequest`
- `checkSessionId`
- `download`
- `passthrough`


## 1) initiate

### PolicyServer Endpoint Example
**Endpoint**: `http://localhost:3000/`

### PolicyServer Expected Payload Example
```json
{
  "action": "initiate",
  "sessionId": "", //optional
   "policyServer": //optional
   {
    "successRedirectUri": "",//optional
    "errorRedirectUri": "",//optional
    "responseRedirectUri": "",//optional
    "presentationDefinitionUri": ""//optional
    },
  "ddo": {
    "credentialSubject": {
      "credentials": [
        {
          "allow": [
            {
              "vp_policies": [
                "signature",
                "expired"
              ],
              "vc_policies": [
                "signature",
                "expired"
              ],
              "request_credentials": [
                {
                  "type": "VerifiableId",
                  "format": "jwt_vc_json"
                },
                {
                  "type": "ProofOfResidence",
                  "format": "jwt_vc_json"
                },
                {
                  "type": "OpenBadgeCredential",
                  "format": "jwt_vc_json",
                  "policies": [
                    "signature",
                    {
                      "policy": "webhook",
                      "args": "https://example.org/abc/xyz"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      "services": [
        {
          "credentials": [
            {
              "allow": [
                {
                  "vp_policies": [
                    "signature",
                    "expired"
                  ],
                  "vc_policies": [
                    "signature",
                    "expired"
                  ],
                  "request_credentials": [
                    {
                      "type": "VerifiableId",
                      "format": "jwt_vc_json"
                    },
                    {
                      "type": "ProofOfResidence",
                      "format": "jwt_vc_json"
                    },
                    {
                      "type": "OpenBadgeCredential",
                      "format": "jwt_vc_json",
                      "policies": [
                        "signature",
                        {
                          "policy": "webhook",
                          "args": "https://example.org/abc/xyz"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  }
}

```


### Walt.Id Endpoint Example
**Endpoint**: `https://verifier.portal.walt.id/verify/`

### Walt.Id Params
**successRedirectUri**: `is an env variable, optional.`
**StateId**: `Is generated by PolicyServer and represents the session id, included in response.`
```stateId: randomUUID()```

Policy Server will always add default VP and VC policies, if they are specified in ENV.  (revoked-status-list is this case)

### Walt.Id Payload Example Generated by PolicyServer
```json
{
  "vp_policies": [
    "expired",
    "signature",
    "revoked-status-list"
  ],
  "vc_policies": [
    "expired",
    "signature",
    "revoked-status-list"
  ],
  "request_credentials": [
    {
      "type": "VerifiableId",
      "format": "jwt_vc_json"
    },
    {
      "type": "ProofOfResidence",
      "format": "jwt_vc_json"
    },
    {
      "type": "OpenBadgeCredential",
      "format": "jwt_vc_json",
      "policies": [
        "signature",
        {
          "policy": "webhook",
          "args": "https://example.org/abc/xyz"
        }
      ]
    }
  ]
}

```

### PolicyServer Response Example
```json
{
  "success": true,
  "message": "openid4vp://authorize?response_type=vp_token&client_id=https%3A%2F%2Fverifier.portal.walt.id%2Fopenid4vc%2Fverify&response_mode=direct_post&state=ec64a21c-3d81-44f9-8b1d-099c1ec0c7b6&presentation_definition_uri=https%3A%2F%2Fverifier.portal.walt.id%2Fopenid4vc%2Fpd%2Fec64a21c-3d81-44f9-8b1d-099c1ec0c7b6&client_id_scheme=redirect_uri&client_metadata=%7B%22authorization_encrypted_response_alg%22%3A%22ECDH-ES%22%2C%22authorization_encrypted_response_enc%22%3A%22A256GCM%22%7D&nonce=a6a70049-c347-4046-89db-7090b43c858f&response_uri=https%3A%2F%2Fverifier.portal.walt.id%2Fopenid4vc%2Fverify%2Fec64a21c-3d81-44f9-8b1d-099c1ec0c7b6",
  "httpStatus": 200
}

```
In this case `state=ec64a21c-3d81-44f9-8b1d-099c1ec0c7b6` represents Session Id.
Also, Policy Server replace default `response_uri` by `WALTID_VERIFY_RESPONSE_REDIRECT_URL` env variable and `presentation_definition_uri` by `WALTID_VERIFY_PRESENTATION_DEFINITION_URL` env variable, 
ex. `https://verifier.portal.walt.id/openid4vc/verify/$id`and `http://ocean-node-vm2.oceanenterprise.io:8100/pd/$id` where $id represents the session id.


## 2) presentationRequest

### PolicyServer Endpoint Example
**Endpoint**: `http://localhost:3000/`

### PolicyServer Expected Payload Example
```json
{
  "action": "presentationRequest",
     "sessionId": "ec64a21c-3d81-44f9-8b1d-099c1ec0c7b6",
    "vp_token": the vp token,
    "response": the response,
    "presentation_submission": the presentation_submission
}
```

### Walt.Id Endpoint Example
**Endpoint**: `https://verifier.portal.walt.id/openid4vc/verify/{id}`

**In this example**: `"https://verifier.portal.walt.id/openid4vc/verify/ec64a21c-3d81-44f9-8b1d-099c1ec0c7b6"`.

### PolicyServer Response Example
```json
{
  "success": true,
  "message": {
    "successRedirectUri": "empty or the process.env.WALTID_SUCCESS_REDIRECT_URL",
    "sessionId": "ec64a21c-3d81-44f9-8b1d-099c1ec0c7b6",
    "errorRedirectUri": "empty or the error message if the process.env.WALTID_ERROR_REDIRECT_URL not specified",
  },
  "httpStatus": 200
}

```

**success** is true, if **process.env.WALTID_SUCCESS_REDIRECT_URL** is null, or it is the same, as **redirect_uri** from response.

## 3) checkSessionId

### PolicyServer Endpoint Example
**Endpoint**: `http://localhost:3000/`

### PolicyServer Expected Payload Example
```json
{
  "action": "checkSessionId",
   "sessionId": "ec64a21c-3d81-44f9-8b1d-099c1ec0c7b6"
}
```

### Walt.Id Endpoint Example
**Endpoint**: `https://verifier.portal.walt.id/openid4vc/session/{id}`

**In this example**: `"https://verifier.portal.walt.id/openid4vc/session/ec64a21c-3d81-44f9-8b1d-099c1ec0c7b6"`.

### PolicyServer Response Example
```json
{
  "success": true,
  "message": {
    presentation state object
  },
  "httpStatus": 200
}

```


## 4) getPD

### PolicyServer Endpoint Example
**Endpoint**: `http://localhost:3000/`

### PolicyServer Expected Payload Example
```json
{
  "action": "getPD",
   "sessionId": "ec64a21c-3d81-44f9-8b1d-099c1ec0c7b6"
}
```

### Walt.Id Endpoint Example
**Endpoint**: `https://verifier.portal.walt.id/openid4vc/pd/{id}`

**In this example**: `"https://verifier.portal.walt.id/openid4vc/pd/ec64a21c-3d81-44f9-8b1d-099c1ec0c7b6"`.

### PolicyServer Response Example
```json
{
  "success": true,
  "message": {
    presentation definition
  },
  "httpStatus": 200
}

```

**success** is true, if **verificationResult** property received from the verifier is also true.

## 5) download

### PolicyServer Endpoint Example
**Endpoint**: `http://localhost:3000/`

### PolicyServer Expected Payload Example
```json
{
  "action": "download",
  "policyServer":
  {
    "sessionId": "ec64a21c-3d81-44f9-8b1d-099c1ec0c7b6"
  }
  
}
```

### Walt.Id Endpoint Example
**Endpoint**: `https://verifier.portal.walt.id/session/{id}`

**In this example**: `"https://verifier.portal.walt.id/session/ec64a21c-3d81-44f9-8b1d-099c1ec0c7b6"`.

### PolicyServer Response Example
```json
{
  "success": true,
  "message": {
    presentation state object
  },
  "httpStatus": 200
}

```

**success** is true, if **verificationResult** property in presentation state object is also true.


## 6) passthrough

### PolicyServer Endpoint Example
**Endpoint**: `http://localhost:3000/`

### PolicyServer Expected Payload Example

```json

 {
  "action": "passthrough",
  "url": "/openid4vc/verify",
  "httpMethod": "POST",
  "body": {
    "request_credentials": [
      {
        "format": "jwt_vc_json",
        "type": "OpenBadgeCredential"
      }
    ]
  },
}

```

### PolicyServer Response Example
```json

{
  "success": true,
  "message": "openid4vp://authorize?response_type=vp_token&client_id=https%3A%2F%2Fverifier.portal.walt.id%2Fopenid4vc%2Fverify&response_mode=direct_post&state=yidllNybpwZe&presentation_definition_uri=https%3A%2F%2Fverifier.portal.walt.id%2Fopenid4vc%2Fpd%2FyidllNybpwZe&client_id_scheme=redirect_uri&client_metadata=%7B%22authorization_encrypted_response_alg%22%3A%22ECDH-ES%22%2C%22authorization_encrypted_response_enc%22%3A%22A256GCM%22%7D&nonce=a0d5ba73-e27d-45da-9780-8b05428c3a61&response_uri=https%3A%2F%2Fverifier.portal.walt.id%2Fopenid4vc%2Fverify%2FyidllNybpwZe",
  "httpStatus": 200
}

```
