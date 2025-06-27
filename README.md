# Policy Server

Policy Server implementation.

## Quick Start

To get the Policy Server up and running in a Docker container:





## ENV Example
```
AUTH_TYPE = "waltid"
WALTID_VERIFIER_URL="https://verifier.portal.walt.id"
OCEAN_NODE_URL="http://ocean-node-vm1.oceanenterprise.io:8000"
WALTID_SUCCESS_REDIRECT_URL="https://example.com/success?id=\$id"
WALTID_ERROR_REDIRECT_URL="https://example.com/error?id=\$id"
WALTID_VERIFY_RESPONSE_REDIRECT_URL="http://ocean-node-vm2.oceanenterprise.io:8100/verify/\$id"
WALTID_VERIFY_PRESENTATION_DEFINITION_URL="http://ocean-node-vm2.oceanenterprise.io:8100/pd/\$id"
DEFAULT_VP_POLICIES=["expired","signature","revoked-status-list","not-before"]
DEFAULT_VC_POLICIES=["expired","signature","revoked-status-list","not-before"]
ENABLE_LOGS="1"
MODE_PROXY="1"
MODE_PS="1"
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
- `startCompute`
- `encrypt`
- `decrypt`
- `newDDO`
- `updateDDO`
- `validateDDO`
- `passthrough`


## 1) initiate

### PolicyServer Endpoint Example
**Endpoint**: `http://localhost:3000/`

### PolicyServer Expected Payload Example
```json
{
  "action": "initiate",
  "sessionId": "",
  "serviceId": "ff294c2e2c7d01bd5f9701abc117737917bb1f91044ba6b2d0903fc806db0d65",
  "consumerAddress": "0xd727fb9be39fa019d7c02fea19e54d688da3a662",
  "policyServer": {
    "successRedirectUri": "",
    "errorRedirectUri": "",
    "responseRedirectUri": "",
    "presentationDefinitionUri": ""
  },
  "ddo": {
    "@context": [
      "https://www.w3.org/ns/credentials/v2"
    ],
    "id": "did:ope:1ec8435672854acf15ef3e61216900f314f8fae5e04e6b2fb0dc91c0579e0d02",
    "version": "5.0.0",
    "credentialSubject": {
      "credentials": {
        "allow": [
          {
            "values": [
              {
                "request_credentials": [
                  {
                    "format": "jwt_vc_json",
                    "policies": [],
                    "type": "UniversityDegree"
                  }
                ],
                "vc_policies": [
                  "signature",
                  "not-before",
                  "revoked-status-list"
                ],
                "vp_policies": []
              }
            ],
            "type": "SSIpolicy"
          },
          {
            "values": [
              "*"
            ],
            "type": "address"
          }
        ],
        "deny": [],
        "match_deny": "any"
      },
      "chainId": 11155111,
      "metadata": {
        "created": "2025-04-15T19:48:54Z",
        "updated": "2025-04-15T19:48:54Z",
        "type": "dataset",
        "name": "Test data set with SSI credentials - 8",
        "description": {
          "@value": "Test data set with SSI credentials - 8\n\nAccess to the asset allowed to UniversityDegree holders.",
          "@direction": "",
          "@language": ""
        },
        "tags": [
          "test"
        ],
        "author": "",
        "license": {
          "name": "https://github.com/MBadea17/testdata/blob/af26d4f968fdb6e1882c2a3cca16a1480ca44a9c/License%20Agreement.pdf",
          "licenseDocuments": [
            {
              "sha256": "7939fa7e4201a373a3471feccd878c026cad50cc7d4308b6849741782b0691f7",
              "mirrors": [
                {
                  "method": "get",
                  "type": "url",
                  "url": "https://github.com/MBadea17/testdata/blob/af26d4f968fdb6e1882c2a3cca16a1480ca44a9c/License%20Agreement.pdf"
                }
              ],
              "name": "https://github.com/MBadea17/testdata/blob/af26d4f968fdb6e1882c2a3cca16a1480ca44a9c/License%20Agreement.pdf",
              "fileType": "text/html; charset=utf-8"
            }
          ]
        },
        "links": {},
        "additionalInformation": {
          "termsAndConditions": true
        },
        "copyrightHolder": "",
        "providedBy": ""
      },
      "services": [
        {
          "credentials": {
            "allow": [
              {
                "values": [
                  {
                    "request_credentials": [],
                    "vc_policies": [
                      "signature",
                      "not-before",
                      "revoked-status-list"
                    ],
                    "vp_policies": []
                  }
                ],
                "type": "SSIpolicy"
              },
              {
                "values": [
                  "0xd727fb9be39fa019d7c02fea19e54d688da3a662"
                ],
                "type": "address"
              }
            ],
            "match_deny": "any",
            "deny": []
          },
          "name": "Service 1",
          "files": "0x048d5a53cfc89686e6cde36df81495a3eda3c42044240254fbd7b93e7e11b1272e867e448a64d639d490bdbb9f3a45be4d0a54d53a3b92317c57ca270899dc29b97d3f0fe6fba6a40d3d9ff1438bf8c36732af3b47c4056486e8fcd7dcddba2038bce7fb24ec4e28ae889a4556e61dbeda5344a102d60c88dfbc1fe84e983a0d360c269705071c9191f982c832c93b39d91c688787af4d55b55e5afb38e0ad8eb5d92bd7a51935daa8d4e394436b6f911883516c7f3c875753673acab80859664f5dde7ce7279d7948c5987271989aacd261751cb933e454919f0cd4f1e075e0d138c5425a4fae3e1046b7fdbe8aec7b29bacac922a01f3b37203b67c0ac0a246ac0b0acdb2b5d21c1723daeae63555847c0e9e4b54f9bad995ba8b9098616f82b5a89d9c21fbac07035530a6010ca9ccc94f7474397701b8df23496206402d670cebd2964a8b4a0f45039cf3519b4ce30ae5b0744b22a5ceb5e9db0a8c8431d19356f9284cac87da509da54bc85b1811878bd72de38adbad9b9945a1cf6272d5ed877e498a1",
          "description": {
            "@value": "Service accessible to address 0xD727FB9Be39fA019d7C02fea19E54d688Da3a662",
            "@direction": "",
            "@language": ""
          },
          "id": "7b2ca00f457ecc21eff766d39f2f35e1ee5e5d427eb3f62aa7297080388eeff6",
          "datatokenAddress": "0x879A899d5DCDa773e3cD8188Af45eAf7194c24d2",
          "serviceEndpoint": "https://ocean-node-vm3.oceanenterprise.io",
          "state": 0,
          "type": "access",
          "timeout": 0
        },
        {
          "credentials": {
            "allow": [
              {
                "values": [
                  {
                    "request_credentials": [
                      {
                        "format": "jwt_vc_json",
                        "policies": [],
                        "type": "VerifiableId"
                      }
                    ],
                    "vc_policies": [
                      "signature",
                      "not-before",
                      "revoked-status-list"
                    ],
                    "vp_policies": []
                  }
                ],
                "type": "SSIpolicy"
              }
            ],
            "match_deny": "any",
            "deny": []
          },
          "name": "Service 2",
          "description": {
            "@value": "Service accessible to holder of VerifiableId credentials",
            "@direction": "",
            "@language": ""
          },
          "files": "0x048d5a53cfc89686e6cde36df81495a3eda3c42044240254fbd7b93e7e11b1272e867e448a64d639d490bdbb9f3a45be4d0a54d53a3b92317c57ca270899dc29b97d3f0fe6fba6a40d3d9ff1438bf8c36732af3b47c4056486e8fcd7dcddba2038bce7fb24ec4e28ae889a4556e61dbeda5344a102d60c88dfbc1fe84e983a0d360c269705071c9191f982c832c93b39d91c688787af4d55b55e5afb38e0ad8eb5d92bd7a51935daa8d4e394436b6f911883516c7f3c875753673acab80859664f5dde7ce7279d7948c5987271989aacd261751cb933e454919f0cd4f1e075e0d138c5425a4fae3e1046b7fdbe8aec7b29bacac922a01f3b37203b67c0ac0a246ac0b0acdb2b5d21c1723daeae63555847c0e9e4b54f9bad995ba8b9098616f82b5a89d9c21fbac07035530a6010ca9ccc94f7474397701b8df23496206402d670cebd2964a8b4a0f45039cf3519b4ce30ae5b0744b22a5ceb5e9db0a8c8431d19356f9284cac87da509da54bc85b1811878bd72de38adbad9b9945a1cf6272d5ed877e498a1",
          "id": "ff294c2e2c7d01bd5f9701abc117737917bb1f91044ba6b2d0903fc806db0d65",
          "datatokenAddress": "0x18945267E5C9f56f9626206711a31afaCea4Ae6B",
          "serviceEndpoint": "https://ocean-node-vm3.oceanenterprise.io",
          "state": 0,
          "type": "access",
          "timeout": 86400
        },
        {
          "credentials": {
            "allow": [
              {
                "values": [
                  {
                    "request_credentials": [],
                    "vc_policies": [
                      "signature",
                      "not-before",
                      "revoked-status-list"
                    ],
                    "vp_policies": []
                  }
                ],
                "type": "SSIpolicy"
              }
            ],
            "match_deny": "any",
            "deny": [
              {
                "values": [
                  "0x61db12d8b636cb49ea09eca58a893da9480e1f33"
                ],
                "type": "address"
              }
            ]
          },
          "name": "Service 3",
          "description": {
            "@value": "Service not accessible to address 0x61DB12d8b636Cb49ea09eCa58a893dA9480E1F33",
            "@direction": "",
            "@language": ""
          },
          "files": "0x048d5a53cfc89686e6cde36df81495a3eda3c42044240254fbd7b93e7e11b1272e867e448a64d639d490bdbb9f3a45be4d0a54d53a3b92317c57ca270899dc29b97d3f0fe6fba6a40d3d9ff1438bf8c36732af3b47c4056486e8fcd7dcddba2038bce7fb24ec4e28ae889a4556e61dbeda5344a102d60c88dfbc1fe84e983a0d360c269705071c9191f982c832c93b39d91c688787af4d55b55e5afb38e0ad8eb5d92bd7a51935daa8d4e394436b6f911883516c7f3c875753673acab80859664f5dde7ce7279d7948c5987271989aacd261751cb933e454919f0cd4f1e075e0d138c5425a4fae3e1046b7fdbe8aec7b29bacac922a01f3b37203b67c0ac0a246ac0b0acdb2b5d21c1723daeae63555847c0e9e4b54f9bad995ba8b9098616f82b5a89d9c21fbac07035530a6010ca9ccc94f7474397701b8df23496206402d670cebd2964a8b4a0f45039cf3519b4ce30ae5b0744b22a5ceb5e9db0a8c8431d19356f9284cac87da509da54bc85b1811878bd72de38adbad9b9945a1cf6272d5ed877e498a1",
          "id": "91d8c931ed389ae61d3ed18f89f1db41db381a706b54bfaa1db15f114a2a9cd8",
          "datatokenAddress": "0xb0fd7A05b4de95f3FFd31932515e66B7b92ee96a",
          "serviceEndpoint": "https://ocean-node-vm3.oceanenterprise.io",
          "state": 0,
          "type": "access",
          "timeout": 86400
        }
      ],
      "nftAddress": "0x09e939308A16e1B27088bbf6932D91EC8b5F42b8",
      "nft": {
        "state": 0,
        "address": "0x09e939308A16e1B27088bbf6932D91EC8b5F42b8",
        "name": "Data NFT",
        "symbol": "OEC-NFT",
        "owner": "0x00Dc9e712D3b31Ab5446A5A7CeaDe0a2901E6d26",
        "created": "2025-04-15T19:59:24Z",
        "tokenURI": ""
      },
      "stats": {
        "allocated": 0,
        "orders": 0,
        "price": {
          "value": 2,
          "tokenSymbol": "OCEAN",
          "tokenAddress": "0x1B083D8584dd3e6Ff37d04a6e7e82b5F622f3985"
        }
      },
      "datatokens": [
        {
          "symbol": "DT1",
          "address": "0x879A899d5DCDa773e3cD8188Af45eAf7194c24d2",
          "name": "Datatoken",
          "serviceId": "7b2ca00f457ecc21eff766d39f2f35e1ee5e5d427eb3f62aa7297080388eeff6"
        },
        {
          "symbol": "DT1",
          "address": "0x18945267E5C9f56f9626206711a31afaCea4Ae6B",
          "name": "Datatoken",
          "serviceId": "ff294c2e2c7d01bd5f9701abc117737917bb1f91044ba6b2d0903fc806db0d65"
        },
        {
          "symbol": "DT1",
          "address": "0xb0fd7A05b4de95f3FFd31932515e66B7b92ee96a",
          "name": "Datatoken",
          "serviceId": "91d8c931ed389ae61d3ed18f89f1db41db381a706b54bfaa1db15f114a2a9cd8"
        }
      ],
      "event": {
        "txid": "0x71a250f4992c28f09ed9170b70732874eafeef8e8da653faab1c0258ea45fc98",
        "from": "0x00Dc9e712D3b31Ab5446A5A7CeaDe0a2901E6d26",
        "contract": "0x09e939308A16e1B27088bbf6932D91EC8b5F42b8",
        "block": 8125544,
        "datetime": "2025-04-15T19:59:24.000Z"
      },
      "purgatory": {
        "state": false
      }
    },
    "additionalDdos": [],
    "type": [
      "VerifiableCredential"
    ],
    "issuer": "did:jwk:eyJrdHkiOiJPS1AiLCJkIjoiUnBVOU5ONmdFbGtvMXpjYnR1VVRERlVXWEZCeks1Um9FZ3FRaVFHMWN4QSIsImNydiI6IkVkMjU1MTkiLCJraWQiOiI1TS1od19JbTZDalJDZ3NCVXhGX0R2aWxRRnhfdVU5RWpNcUpPbzdQOERnIiwieCI6IklaeXo1WVl6WkpJYWN3R21ockstYXdCa2ZJWmRqbUFWWTViVjFIbGNxYjgifQ",
    "proof": {
      "signature": "N2GQRLQbDUM7gLlUNweF-JjP9XS1uAWHWZy-8NLdlBdPJFrdvVkZk1z6UntVqATkCZU-l8MMQP_5DyMDzws3DA",
      "header": {
        "kid": "5M-hw_Im6CjRCgsBUxF_DvilQFx_uU9EjMqJOo7P8Dg",
        "alg": "EdDSA"
      }
    },
    "accessDetails": [
      {
        "type": "fixed",
        "price": "2.0",
        "addressOrId": "0x33d13b46dec069713aa8c3e8b86ee3dd948691ca18ea261b9d464920afa3940f",
        "baseToken": {
          "address": "0x1B083D8584dd3e6Ff37d04a6e7e82b5F622f3985",
          "name": "Ocean Token",
          "symbol": "OCEAN",
          "decimals": 18
        },
        "datatoken": {
          "address": "0x879A899d5DCDa773e3cD8188Af45eAf7194c24d2",
          "name": "Access Token",
          "symbol": "OEAT",
          "decimals": 0
        },
        "paymentCollector": "0x00Dc9e712D3b31Ab5446A5A7CeaDe0a2901E6d26",
        "templateId": 2,
        "isOwned": false,
        "validOrderTx": "",
        "isPurchasable": true,
        "publisherMarketOrderFee": "0"
      },
      {
        "type": "fixed",
        "price": "2.0",
        "addressOrId": "0x25b94927c6ab131165d72d45fa3d1fd595ba224e046be56468dbd36dd078ea83",
        "baseToken": {
          "address": "0x1B083D8584dd3e6Ff37d04a6e7e82b5F622f3985",
          "name": "Ocean Token",
          "symbol": "OCEAN",
          "decimals": 18
        },
        "datatoken": {
          "address": "0x18945267E5C9f56f9626206711a31afaCea4Ae6B",
          "name": "DataToken",
          "symbol": "DT",
          "decimals": 0
        },
        "paymentCollector": "0x00Dc9e712D3b31Ab5446A5A7CeaDe0a2901E6d26",
        "templateId": 2,
        "isOwned": false,
        "validOrderTx": "",
        "isPurchasable": true,
        "publisherMarketOrderFee": "0"
      },
      {
        "type": "fixed",
        "price": "5.0",
        "addressOrId": "0x4d51f22682adff2aba9854c024de4d0f9abc0943095515cb1cd90b36eba45308",
        "baseToken": {
          "address": "0x1B083D8584dd3e6Ff37d04a6e7e82b5F622f3985",
          "name": "Ocean Token",
          "symbol": "OCEAN",
          "decimals": 18
        },
        "datatoken": {
          "address": "0xb0fd7A05b4de95f3FFd31932515e66B7b92ee96a",
          "name": "DataToken",
          "symbol": "DT",
          "decimals": 0
        },
        "paymentCollector": "0x00Dc9e712D3b31Ab5446A5A7CeaDe0a2901E6d26",
        "templateId": 2,
        "isOwned": false,
        "validOrderTx": "",
        "isPurchasable": true,
        "publisherMarketOrderFee": "0"
      }
    ]
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
  "serviceId": "ff294c2e2c7d01bd5f9701abc117737917bb1f91044ba6b2d0903fc806db0d65",
  "consumerAddress": "0xd727fb9be39fa019d7c02fea19e54d688da3a662",
  "policyServer": {
    "successRedirectUri": "",
    "sessionId": "ba46717d-e44f-490b-a8d6-522bd9153f9e",
    "errorRedirectUri": "",
    "responseRedirectUri": "",
    "presentationDefinitionUri": ""
  },
  "ddo": {
    "@context": [
      "https://www.w3.org/ns/credentials/v2"
    ],
    "id": "did:ope:1ec8435672854acf15ef3e61216900f314f8fae5e04e6b2fb0dc91c0579e0d02",
    "version": "5.0.0",
    "credentialSubject": {
      "credentials": {
        "allow": [
          {
            "values": [
              {
                "request_credentials": [
                  {
                    "format": "jwt_vc_json",
                    "policies": [],
                    "type": "UniversityDegree"
                  }
                ],
                "vc_policies": [
                  "signature",
                  "not-before",
                  "revoked-status-list"
                ],
                "vp_policies": []
              }
            ],
            "type": "SSIpolicy"
          },
          {
            "values": [
              "*"
            ],
            "type": "address"
          }
        ],
        "deny": [],
        "match_deny": "any"
      },
      "chainId": 11155111,
      "metadata": {
        "created": "2025-04-15T19:48:54Z",
        "updated": "2025-04-15T19:48:54Z",
        "type": "dataset",
        "name": "Test data set with SSI credentials - 8",
        "description": {
          "@value": "Test data set with SSI credentials - 8\n\nAccess to the asset allowed to UniversityDegree holders.",
          "@direction": "",
          "@language": ""
        },
        "tags": [
          "test"
        ],
        "author": "",
        "license": {
          "name": "https://github.com/MBadea17/testdata/blob/af26d4f968fdb6e1882c2a3cca16a1480ca44a9c/License%20Agreement.pdf",
          "licenseDocuments": [
            {
              "sha256": "7939fa7e4201a373a3471feccd878c026cad50cc7d4308b6849741782b0691f7",
              "mirrors": [
                {
                  "method": "get",
                  "type": "url",
                  "url": "https://github.com/MBadea17/testdata/blob/af26d4f968fdb6e1882c2a3cca16a1480ca44a9c/License%20Agreement.pdf"
                }
              ],
              "name": "https://github.com/MBadea17/testdata/blob/af26d4f968fdb6e1882c2a3cca16a1480ca44a9c/License%20Agreement.pdf",
              "fileType": "text/html; charset=utf-8"
            }
          ]
        },
        "links": {},
        "additionalInformation": {
          "termsAndConditions": true
        },
        "copyrightHolder": "",
        "providedBy": ""
      },
      "services": [
        {
          "credentials": {
            "allow": [
              {
                "values": [
                  {
                    "request_credentials": [],
                    "vc_policies": [
                      "signature",
                      "not-before",
                      "revoked-status-list"
                    ],
                    "vp_policies": []
                  }
                ],
                "type": "SSIpolicy"
              },
              {
                "values": [
                  "0xd727fb9be39fa019d7c02fea19e54d688da3a662"
                ],
                "type": "address"
              }
            ],
            "match_deny": "any",
            "deny": []
          },
          "name": "Service 1",
          "files": "0x048d5a53cfc89686e6cde36df81495a3eda3c42044240254fbd7b93e7e11b1272e867e448a64d639d490bdbb9f3a45be4d0a54d53a3b92317c57ca270899dc29b97d3f0fe6fba6a40d3d9ff1438bf8c36732af3b47c4056486e8fcd7dcddba2038bce7fb24ec4e28ae889a4556e61dbeda5344a102d60c88dfbc1fe84e983a0d360c269705071c9191f982c832c93b39d91c688787af4d55b55e5afb38e0ad8eb5d92bd7a51935daa8d4e394436b6f911883516c7f3c875753673acab80859664f5dde7ce7279d7948c5987271989aacd261751cb933e454919f0cd4f1e075e0d138c5425a4fae3e1046b7fdbe8aec7b29bacac922a01f3b37203b67c0ac0a246ac0b0acdb2b5d21c1723daeae63555847c0e9e4b54f9bad995ba8b9098616f82b5a89d9c21fbac07035530a6010ca9ccc94f7474397701b8df23496206402d670cebd2964a8b4a0f45039cf3519b4ce30ae5b0744b22a5ceb5e9db0a8c8431d19356f9284cac87da509da54bc85b1811878bd72de38adbad9b9945a1cf6272d5ed877e498a1",
          "description": {
            "@value": "Service accessible to address 0xD727FB9Be39fA019d7C02fea19E54d688Da3a662",
            "@direction": "",
            "@language": ""
          },
          "id": "7b2ca00f457ecc21eff766d39f2f35e1ee5e5d427eb3f62aa7297080388eeff6",
          "datatokenAddress": "0x879A899d5DCDa773e3cD8188Af45eAf7194c24d2",
          "serviceEndpoint": "https://ocean-node-vm3.oceanenterprise.io",
          "state": 0,
          "type": "access",
          "timeout": 0
        },
        {
          "credentials": {
            "allow": [
              {
                "values": [
                  {
                    "request_credentials": [
                      {
                        "format": "jwt_vc_json",
                        "policies": [],
                        "type": "VerifiableId"
                      }
                    ],
                    "vc_policies": [
                      "signature",
                      "not-before",
                      "revoked-status-list"
                    ],
                    "vp_policies": []
                  }
                ],
                "type": "SSIpolicy"
              }
            ],
            "match_deny": "any",
            "deny": []
          },
          "name": "Service 2",
          "description": {
            "@value": "Service accessible to holder of VerifiableId credentials",
            "@direction": "",
            "@language": ""
          },
          "files": "0x048d5a53cfc89686e6cde36df81495a3eda3c42044240254fbd7b93e7e11b1272e867e448a64d639d490bdbb9f3a45be4d0a54d53a3b92317c57ca270899dc29b97d3f0fe6fba6a40d3d9ff1438bf8c36732af3b47c4056486e8fcd7dcddba2038bce7fb24ec4e28ae889a4556e61dbeda5344a102d60c88dfbc1fe84e983a0d360c269705071c9191f982c832c93b39d91c688787af4d55b55e5afb38e0ad8eb5d92bd7a51935daa8d4e394436b6f911883516c7f3c875753673acab80859664f5dde7ce7279d7948c5987271989aacd261751cb933e454919f0cd4f1e075e0d138c5425a4fae3e1046b7fdbe8aec7b29bacac922a01f3b37203b67c0ac0a246ac0b0acdb2b5d21c1723daeae63555847c0e9e4b54f9bad995ba8b9098616f82b5a89d9c21fbac07035530a6010ca9ccc94f7474397701b8df23496206402d670cebd2964a8b4a0f45039cf3519b4ce30ae5b0744b22a5ceb5e9db0a8c8431d19356f9284cac87da509da54bc85b1811878bd72de38adbad9b9945a1cf6272d5ed877e498a1",
          "id": "ff294c2e2c7d01bd5f9701abc117737917bb1f91044ba6b2d0903fc806db0d65",
          "datatokenAddress": "0x18945267E5C9f56f9626206711a31afaCea4Ae6B",
          "serviceEndpoint": "https://ocean-node-vm3.oceanenterprise.io",
          "state": 0,
          "type": "access",
          "timeout": 86400
        },
        {
          "credentials": {
            "allow": [
              {
                "values": [
                  {
                    "request_credentials": [],
                    "vc_policies": [
                      "signature",
                      "not-before",
                      "revoked-status-list"
                    ],
                    "vp_policies": []
                  }
                ],
                "type": "SSIpolicy"
              }
            ],
            "match_deny": "any",
            "deny": [
              {
                "values": [
                  "0x61db12d8b636cb49ea09eca58a893da9480e1f33"
                ],
                "type": "address"
              }
            ]
          },
          "name": "Service 3",
          "description": {
            "@value": "Service not accessible to address 0x61DB12d8b636Cb49ea09eCa58a893dA9480E1F33",
            "@direction": "",
            "@language": ""
          },
          "files": "0x048d5a53cfc89686e6cde36df81495a3eda3c42044240254fbd7b93e7e11b1272e867e448a64d639d490bdbb9f3a45be4d0a54d53a3b92317c57ca270899dc29b97d3f0fe6fba6a40d3d9ff1438bf8c36732af3b47c4056486e8fcd7dcddba2038bce7fb24ec4e28ae889a4556e61dbeda5344a102d60c88dfbc1fe84e983a0d360c269705071c9191f982c832c93b39d91c688787af4d55b55e5afb38e0ad8eb5d92bd7a51935daa8d4e394436b6f911883516c7f3c875753673acab80859664f5dde7ce7279d7948c5987271989aacd261751cb933e454919f0cd4f1e075e0d138c5425a4fae3e1046b7fdbe8aec7b29bacac922a01f3b37203b67c0ac0a246ac0b0acdb2b5d21c1723daeae63555847c0e9e4b54f9bad995ba8b9098616f82b5a89d9c21fbac07035530a6010ca9ccc94f7474397701b8df23496206402d670cebd2964a8b4a0f45039cf3519b4ce30ae5b0744b22a5ceb5e9db0a8c8431d19356f9284cac87da509da54bc85b1811878bd72de38adbad9b9945a1cf6272d5ed877e498a1",
          "id": "91d8c931ed389ae61d3ed18f89f1db41db381a706b54bfaa1db15f114a2a9cd8",
          "datatokenAddress": "0xb0fd7A05b4de95f3FFd31932515e66B7b92ee96a",
          "serviceEndpoint": "https://ocean-node-vm3.oceanenterprise.io",
          "state": 0,
          "type": "access",
          "timeout": 86400
        }
      ],
      "nftAddress": "0x09e939308A16e1B27088bbf6932D91EC8b5F42b8",
      "nft": {
        "state": 0,
        "address": "0x09e939308A16e1B27088bbf6932D91EC8b5F42b8",
        "name": "Data NFT",
        "symbol": "OEC-NFT",
        "owner": "0x00Dc9e712D3b31Ab5446A5A7CeaDe0a2901E6d26",
        "created": "2025-04-15T19:59:24Z",
        "tokenURI": ""
      },
      "stats": {
        "allocated": 0,
        "orders": 0,
        "price": {
          "value": 2,
          "tokenSymbol": "OCEAN",
          "tokenAddress": "0x1B083D8584dd3e6Ff37d04a6e7e82b5F622f3985"
        }
      },
      "datatokens": [
        {
          "symbol": "DT1",
          "address": "0x879A899d5DCDa773e3cD8188Af45eAf7194c24d2",
          "name": "Datatoken",
          "serviceId": "7b2ca00f457ecc21eff766d39f2f35e1ee5e5d427eb3f62aa7297080388eeff6"
        },
        {
          "symbol": "DT1",
          "address": "0x18945267E5C9f56f9626206711a31afaCea4Ae6B",
          "name": "Datatoken",
          "serviceId": "ff294c2e2c7d01bd5f9701abc117737917bb1f91044ba6b2d0903fc806db0d65"
        },
        {
          "symbol": "DT1",
          "address": "0xb0fd7A05b4de95f3FFd31932515e66B7b92ee96a",
          "name": "Datatoken",
          "serviceId": "91d8c931ed389ae61d3ed18f89f1db41db381a706b54bfaa1db15f114a2a9cd8"
        }
      ],
      "event": {
        "txid": "0x71a250f4992c28f09ed9170b70732874eafeef8e8da653faab1c0258ea45fc98",
        "from": "0x00Dc9e712D3b31Ab5446A5A7CeaDe0a2901E6d26",
        "contract": "0x09e939308A16e1B27088bbf6932D91EC8b5F42b8",
        "block": 8125544,
        "datetime": "2025-04-15T19:59:24.000Z"
      },
      "purgatory": {
        "state": false
      }
    },
    "additionalDdos": [],
    "type": [
      "VerifiableCredential"
    ],
    "issuer": "did:jwk:eyJrdHkiOiJPS1AiLCJkIjoiUnBVOU5ONmdFbGtvMXpjYnR1VVRERlVXWEZCeks1Um9FZ3FRaVFHMWN4QSIsImNydiI6IkVkMjU1MTkiLCJraWQiOiI1TS1od19JbTZDalJDZ3NCVXhGX0R2aWxRRnhfdVU5RWpNcUpPbzdQOERnIiwieCI6IklaeXo1WVl6WkpJYWN3R21ockstYXdCa2ZJWmRqbUFWWTViVjFIbGNxYjgifQ",
    "proof": {
      "signature": "N2GQRLQbDUM7gLlUNweF-JjP9XS1uAWHWZy-8NLdlBdPJFrdvVkZk1z6UntVqATkCZU-l8MMQP_5DyMDzws3DA",
      "header": {
        "kid": "5M-hw_Im6CjRCgsBUxF_DvilQFx_uU9EjMqJOo7P8Dg",
        "alg": "EdDSA"
      }
    },
    "accessDetails": [
      {
        "type": "fixed",
        "price": "2.0",
        "addressOrId": "0x33d13b46dec069713aa8c3e8b86ee3dd948691ca18ea261b9d464920afa3940f",
        "baseToken": {
          "address": "0x1B083D8584dd3e6Ff37d04a6e7e82b5F622f3985",
          "name": "Ocean Token",
          "symbol": "OCEAN",
          "decimals": 18
        },
        "datatoken": {
          "address": "0x879A899d5DCDa773e3cD8188Af45eAf7194c24d2",
          "name": "Access Token",
          "symbol": "OEAT",
          "decimals": 0
        },
        "paymentCollector": "0x00Dc9e712D3b31Ab5446A5A7CeaDe0a2901E6d26",
        "templateId": 2,
        "isOwned": false,
        "validOrderTx": "",
        "isPurchasable": true,
        "publisherMarketOrderFee": "0"
      },
      {
        "type": "fixed",
        "price": "2.0",
        "addressOrId": "0x25b94927c6ab131165d72d45fa3d1fd595ba224e046be56468dbd36dd078ea83",
        "baseToken": {
          "address": "0x1B083D8584dd3e6Ff37d04a6e7e82b5F622f3985",
          "name": "Ocean Token",
          "symbol": "OCEAN",
          "decimals": 18
        },
        "datatoken": {
          "address": "0x18945267E5C9f56f9626206711a31afaCea4Ae6B",
          "name": "DataToken",
          "symbol": "DT",
          "decimals": 0
        },
        "paymentCollector": "0x00Dc9e712D3b31Ab5446A5A7CeaDe0a2901E6d26",
        "templateId": 2,
        "isOwned": false,
        "validOrderTx": "",
        "isPurchasable": true,
        "publisherMarketOrderFee": "0"
      },
      {
        "type": "fixed",
        "price": "5.0",
        "addressOrId": "0x4d51f22682adff2aba9854c024de4d0f9abc0943095515cb1cd90b36eba45308",
        "baseToken": {
          "address": "0x1B083D8584dd3e6Ff37d04a6e7e82b5F622f3985",
          "name": "Ocean Token",
          "symbol": "OCEAN",
          "decimals": 18
        },
        "datatoken": {
          "address": "0xb0fd7A05b4de95f3FFd31932515e66B7b92ee96a",
          "name": "DataToken",
          "symbol": "DT",
          "decimals": 0
        },
        "paymentCollector": "0x00Dc9e712D3b31Ab5446A5A7CeaDe0a2901E6d26",
        "templateId": 2,
        "isOwned": false,
        "validOrderTx": "",
        "isPurchasable": true,
        "publisherMarketOrderFee": "0"
      }
    ]
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

## 6) startCompute 

### PolicyServer Endpoint Example
**Endpoint**: `http://localhost:3000/`

### PolicyServer Expected Payload Example
```json
{
  "action": "startCompute",
  "documentId": "did1",
  "serviceId": "ff294c2e2c7d01bd5f9701abc117737917bb1f91044ba6b2d0903fc806db0d65",
  "consumerAddress": "0xd727fb9be39fa019d7c02fea19e54d688da3a662",
  "policyServer": [
    { 
      "documentId": "did1",
      "serviceId": "ff294c2e2c7d01bd5f9701abc117737917bb1f91044ba6b2d0903fc806db0d65",    
      "successRedirectUri": "",
      "sessionId": "",
      "errorRedirectUri": "",
      "responseRedirectUri": "",
      "presentationDefinitionUri": ""
    },
    { 
      "documentId": "did2",
      "serviceId": "service2",    
      "successRedirectUri": "",
      "sessionId": "",
      "errorRedirectUri": "",
      "responseRedirectUri": "",
      "presentationDefinitionUri": ""
    }
  ],
  "ddo": {
    "@context": [
      "https://www.w3.org/ns/credentials/v2"
    ],
    "id": "did:ope:1ec8435672854acf15ef3e61216900f314f8fae5e04e6b2fb0dc91c0579e0d02",
    "version": "5.0.0",
    "credentialSubject": {
      "credentials": {
        "allow": [
          {
            "values": [
              {
                "request_credentials": [
                  {
                    "format": "jwt_vc_json",
                    "policies": [],
                    "type": "UniversityDegree"
                  }
                ],
                "vc_policies": [
                  "signature",
                  "not-before",
                  "revoked-status-list"
                ],
                "vp_policies": []
              }
            ],
            "type": "SSIpolicy"
          },
          {
            "values": [
              "*"
            ],
            "type": "address"
          }
        ],
        "deny": [],
        "match_deny": "any"
      },
      "chainId": 11155111,
      "metadata": {
        "created": "2025-04-15T19:48:54Z",
        "updated": "2025-04-15T19:48:54Z",
        "type": "dataset",
        "name": "Test data set with SSI credentials - 8",
        "description": {
          "@value": "Test data set with SSI credentials - 8\n\nAccess to the asset allowed to UniversityDegree holders.",
          "@direction": "",
          "@language": ""
        },
        "tags": [
          "test"
        ],
        "author": "",
        "license": {
          "name": "https://github.com/MBadea17/testdata/blob/af26d4f968fdb6e1882c2a3cca16a1480ca44a9c/License%20Agreement.pdf",
          "licenseDocuments": [
            {
              "sha256": "7939fa7e4201a373a3471feccd878c026cad50cc7d4308b6849741782b0691f7",
              "mirrors": [
                {
                  "method": "get",
                  "type": "url",
                  "url": "https://github.com/MBadea17/testdata/blob/af26d4f968fdb6e1882c2a3cca16a1480ca44a9c/License%20Agreement.pdf"
                }
              ],
              "name": "https://github.com/MBadea17/testdata/blob/af26d4f968fdb6e1882c2a3cca16a1480ca44a9c/License%20Agreement.pdf",
              "fileType": "text/html; charset=utf-8"
            }
          ]
        },
        "links": {},
        "additionalInformation": {
          "termsAndConditions": true
        },
        "copyrightHolder": "",
        "providedBy": ""
      },
      "services": [
        {
          "credentials": {
            "allow": [
              {
                "values": [
                  {
                    "request_credentials": [],
                    "vc_policies": [
                      "signature",
                      "not-before",
                      "revoked-status-list"
                    ],
                    "vp_policies": []
                  }
                ],
                "type": "SSIpolicy"
              },
              {
                "values": [
                  "0xd727fb9be39fa019d7c02fea19e54d688da3a662"
                ],
                "type": "address"
              }
            ],
            "match_deny": "any",
            "deny": []
          },
          "name": "Service 1",
          "files": "0x048d5a53cfc89686e6cde36df81495a3eda3c42044240254fbd7b93e7e11b1272e867e448a64d639d490bdbb9f3a45be4d0a54d53a3b92317c57ca270899dc29b97d3f0fe6fba6a40d3d9ff1438bf8c36732af3b47c4056486e8fcd7dcddba2038bce7fb24ec4e28ae889a4556e61dbeda5344a102d60c88dfbc1fe84e983a0d360c269705071c9191f982c832c93b39d91c688787af4d55b55e5afb38e0ad8eb5d92bd7a51935daa8d4e394436b6f911883516c7f3c875753673acab80859664f5dde7ce7279d7948c5987271989aacd261751cb933e454919f0cd4f1e075e0d138c5425a4fae3e1046b7fdbe8aec7b29bacac922a01f3b37203b67c0ac0a246ac0b0acdb2b5d21c1723daeae63555847c0e9e4b54f9bad995ba8b9098616f82b5a89d9c21fbac07035530a6010ca9ccc94f7474397701b8df23496206402d670cebd2964a8b4a0f45039cf3519b4ce30ae5b0744b22a5ceb5e9db0a8c8431d19356f9284cac87da509da54bc85b1811878bd72de38adbad9b9945a1cf6272d5ed877e498a1",
          "description": {
            "@value": "Service accessible to address 0xD727FB9Be39fA019d7C02fea19E54d688Da3a662",
            "@direction": "",
            "@language": ""
          },
          "id": "7b2ca00f457ecc21eff766d39f2f35e1ee5e5d427eb3f62aa7297080388eeff6",
          "datatokenAddress": "0x879A899d5DCDa773e3cD8188Af45eAf7194c24d2",
          "serviceEndpoint": "https://ocean-node-vm3.oceanenterprise.io",
          "state": 0,
          "type": "access",
          "timeout": 0
        },
        {
          "credentials": {
            "allow": [
              {
                "values": [
                  {
                    "request_credentials": [
                      {
                        "format": "jwt_vc_json",
                        "policies": [],
                        "type": "VerifiableId"
                      }
                    ],
                    "vc_policies": [
                      "signature",
                      "not-before",
                      "revoked-status-list"
                    ],
                    "vp_policies": []
                  }
                ],
                "type": "SSIpolicy"
              }
            ],
            "match_deny": "any",
            "deny": []
          },
          "name": "Service 2",
          "description": {
            "@value": "Service accessible to holder of VerifiableId credentials",
            "@direction": "",
            "@language": ""
          },
          "files": "0x048d5a53cfc89686e6cde36df81495a3eda3c42044240254fbd7b93e7e11b1272e867e448a64d639d490bdbb9f3a45be4d0a54d53a3b92317c57ca270899dc29b97d3f0fe6fba6a40d3d9ff1438bf8c36732af3b47c4056486e8fcd7dcddba2038bce7fb24ec4e28ae889a4556e61dbeda5344a102d60c88dfbc1fe84e983a0d360c269705071c9191f982c832c93b39d91c688787af4d55b55e5afb38e0ad8eb5d92bd7a51935daa8d4e394436b6f911883516c7f3c875753673acab80859664f5dde7ce7279d7948c5987271989aacd261751cb933e454919f0cd4f1e075e0d138c5425a4fae3e1046b7fdbe8aec7b29bacac922a01f3b37203b67c0ac0a246ac0b0acdb2b5d21c1723daeae63555847c0e9e4b54f9bad995ba8b9098616f82b5a89d9c21fbac07035530a6010ca9ccc94f7474397701b8df23496206402d670cebd2964a8b4a0f45039cf3519b4ce30ae5b0744b22a5ceb5e9db0a8c8431d19356f9284cac87da509da54bc85b1811878bd72de38adbad9b9945a1cf6272d5ed877e498a1",
          "id": "ff294c2e2c7d01bd5f9701abc117737917bb1f91044ba6b2d0903fc806db0d65",
          "datatokenAddress": "0x18945267E5C9f56f9626206711a31afaCea4Ae6B",
          "serviceEndpoint": "https://ocean-node-vm3.oceanenterprise.io",
          "state": 0,
          "type": "access",
          "timeout": 86400
        },
        {
          "credentials": {
            "allow": [
              {
                "values": [
                  {
                    "request_credentials": [],
                    "vc_policies": [
                      "signature",
                      "not-before",
                      "revoked-status-list"
                    ],
                    "vp_policies": []
                  }
                ],
                "type": "SSIpolicy"
              }
            ],
            "match_deny": "any",
            "deny": [
              {
                "values": [
                  "0x61db12d8b636cb49ea09eca58a893da9480e1f33"
                ],
                "type": "address"
              }
            ]
          },
          "name": "Service 3",
          "description": {
            "@value": "Service not accessible to address 0x61DB12d8b636Cb49ea09eCa58a893dA9480E1F33",
            "@direction": "",
            "@language": ""
          },
          "files": "0x048d5a53cfc89686e6cde36df81495a3eda3c42044240254fbd7b93e7e11b1272e867e448a64d639d490bdbb9f3a45be4d0a54d53a3b92317c57ca270899dc29b97d3f0fe6fba6a40d3d9ff1438bf8c36732af3b47c4056486e8fcd7dcddba2038bce7fb24ec4e28ae889a4556e61dbeda5344a102d60c88dfbc1fe84e983a0d360c269705071c9191f982c832c93b39d91c688787af4d55b55e5afb38e0ad8eb5d92bd7a51935daa8d4e394436b6f911883516c7f3c875753673acab80859664f5dde7ce7279d7948c5987271989aacd261751cb933e454919f0cd4f1e075e0d138c5425a4fae3e1046b7fdbe8aec7b29bacac922a01f3b37203b67c0ac0a246ac0b0acdb2b5d21c1723daeae63555847c0e9e4b54f9bad995ba8b9098616f82b5a89d9c21fbac07035530a6010ca9ccc94f7474397701b8df23496206402d670cebd2964a8b4a0f45039cf3519b4ce30ae5b0744b22a5ceb5e9db0a8c8431d19356f9284cac87da509da54bc85b1811878bd72de38adbad9b9945a1cf6272d5ed877e498a1",
          "id": "91d8c931ed389ae61d3ed18f89f1db41db381a706b54bfaa1db15f114a2a9cd8",
          "datatokenAddress": "0xb0fd7A05b4de95f3FFd31932515e66B7b92ee96a",
          "serviceEndpoint": "https://ocean-node-vm3.oceanenterprise.io",
          "state": 0,
          "type": "access",
          "timeout": 86400
        }
      ],
      "nftAddress": "0x09e939308A16e1B27088bbf6932D91EC8b5F42b8",
      "nft": {
        "state": 0,
        "address": "0x09e939308A16e1B27088bbf6932D91EC8b5F42b8",
        "name": "Data NFT",
        "symbol": "OEC-NFT",
        "owner": "0x00Dc9e712D3b31Ab5446A5A7CeaDe0a2901E6d26",
        "created": "2025-04-15T19:59:24Z",
        "tokenURI": ""
      },
      "stats": {
        "allocated": 0,
        "orders": 0,
        "price": {
          "value": 2,
          "tokenSymbol": "OCEAN",
          "tokenAddress": "0x1B083D8584dd3e6Ff37d04a6e7e82b5F622f3985"
        }
      },
      "datatokens": [
        {
          "symbol": "DT1",
          "address": "0x879A899d5DCDa773e3cD8188Af45eAf7194c24d2",
          "name": "Datatoken",
          "serviceId": "7b2ca00f457ecc21eff766d39f2f35e1ee5e5d427eb3f62aa7297080388eeff6"
        },
        {
          "symbol": "DT1",
          "address": "0x18945267E5C9f56f9626206711a31afaCea4Ae6B",
          "name": "Datatoken",
          "serviceId": "ff294c2e2c7d01bd5f9701abc117737917bb1f91044ba6b2d0903fc806db0d65"
        },
        {
          "symbol": "DT1",
          "address": "0xb0fd7A05b4de95f3FFd31932515e66B7b92ee96a",
          "name": "Datatoken",
          "serviceId": "91d8c931ed389ae61d3ed18f89f1db41db381a706b54bfaa1db15f114a2a9cd8"
        }
      ],
      "event": {
        "txid": "0x71a250f4992c28f09ed9170b70732874eafeef8e8da653faab1c0258ea45fc98",
        "from": "0x00Dc9e712D3b31Ab5446A5A7CeaDe0a2901E6d26",
        "contract": "0x09e939308A16e1B27088bbf6932D91EC8b5F42b8",
        "block": 8125544,
        "datetime": "2025-04-15T19:59:24.000Z"
      },
      "purgatory": {
        "state": false
      }
    },
    "additionalDdos": [],
    "type": [
      "VerifiableCredential"
    ],
    "issuer": "did:jwk:eyJrdHkiOiJPS1AiLCJkIjoiUnBVOU5ONmdFbGtvMXpjYnR1VVRERlVXWEZCeks1Um9FZ3FRaVFHMWN4QSIsImNydiI6IkVkMjU1MTkiLCJraWQiOiI1TS1od19JbTZDalJDZ3NCVXhGX0R2aWxRRnhfdVU5RWpNcUpPbzdQOERnIiwieCI6IklaeXo1WVl6WkpJYWN3R21ockstYXdCa2ZJWmRqbUFWWTViVjFIbGNxYjgifQ",
    "proof": {
      "signature": "N2GQRLQbDUM7gLlUNweF-JjP9XS1uAWHWZy-8NLdlBdPJFrdvVkZk1z6UntVqATkCZU-l8MMQP_5DyMDzws3DA",
      "header": {
        "kid": "5M-hw_Im6CjRCgsBUxF_DvilQFx_uU9EjMqJOo7P8Dg",
        "alg": "EdDSA"
      }
    },
    "accessDetails": [
      {
        "type": "fixed",
        "price": "2.0",
        "addressOrId": "0x33d13b46dec069713aa8c3e8b86ee3dd948691ca18ea261b9d464920afa3940f",
        "baseToken": {
          "address": "0x1B083D8584dd3e6Ff37d04a6e7e82b5F622f3985",
          "name": "Ocean Token",
          "symbol": "OCEAN",
          "decimals": 18
        },
        "datatoken": {
          "address": "0x879A899d5DCDa773e3cD8188Af45eAf7194c24d2",
          "name": "Access Token",
          "symbol": "OEAT",
          "decimals": 0
        },
        "paymentCollector": "0x00Dc9e712D3b31Ab5446A5A7CeaDe0a2901E6d26",
        "templateId": 2,
        "isOwned": false,
        "validOrderTx": "",
        "isPurchasable": true,
        "publisherMarketOrderFee": "0"
      },
      {
        "type": "fixed",
        "price": "2.0",
        "addressOrId": "0x25b94927c6ab131165d72d45fa3d1fd595ba224e046be56468dbd36dd078ea83",
        "baseToken": {
          "address": "0x1B083D8584dd3e6Ff37d04a6e7e82b5F622f3985",
          "name": "Ocean Token",
          "symbol": "OCEAN",
          "decimals": 18
        },
        "datatoken": {
          "address": "0x18945267E5C9f56f9626206711a31afaCea4Ae6B",
          "name": "DataToken",
          "symbol": "DT",
          "decimals": 0
        },
        "paymentCollector": "0x00Dc9e712D3b31Ab5446A5A7CeaDe0a2901E6d26",
        "templateId": 2,
        "isOwned": false,
        "validOrderTx": "",
        "isPurchasable": true,
        "publisherMarketOrderFee": "0"
      },
      {
        "type": "fixed",
        "price": "5.0",
        "addressOrId": "0x4d51f22682adff2aba9854c024de4d0f9abc0943095515cb1cd90b36eba45308",
        "baseToken": {
          "address": "0x1B083D8584dd3e6Ff37d04a6e7e82b5F622f3985",
          "name": "Ocean Token",
          "symbol": "OCEAN",
          "decimals": 18
        },
        "datatoken": {
          "address": "0xb0fd7A05b4de95f3FFd31932515e66B7b92ee96a",
          "name": "DataToken",
          "symbol": "DT",
          "decimals": 0
        },
        "paymentCollector": "0x00Dc9e712D3b31Ab5446A5A7CeaDe0a2901E6d26",
        "templateId": 2,
        "isOwned": false,
        "validOrderTx": "",
        "isPurchasable": true,
        "publisherMarketOrderFee": "0"
      }
    ]
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


## 7 encrypt

### PolicyServer Endpoint Example
**Endpoint**: `http://localhost:3000/`

### PolicyServer Expected Payload Example

```json

{
  "action": "encrypt",
  "policyServer": {}
}

```


## 8 decrypt

### PolicyServer Endpoint Example
**Endpoint**: `http://localhost:3000/`

### PolicyServer Expected Payload Example

```json

{
  "action": "decrypt",
  "decrypterAddress": "0x123",
  "chainId": 1,
  "transactionId": "0x123",
  "dataNftAddress": "0x123",
  "policyServer": {}
}

```


## 9 newDDO

### PolicyServer Endpoint Example
**Endpoint**: `http://localhost:3000/`

### PolicyServer Expected Payload Example

```json

 {
  "action":"newDDO",
  "rawDDO": {},
  "chainId": 1,
  "txId": "0x123",
  "eventRaw": "raw event data"
}

```


## 10 updateDDO

### PolicyServer Endpoint Example
**Endpoint**: `http://localhost:3000/`

### PolicyServer Expected Payload Example

```json

 {
  "action":"updateDDO",
  "rawDDO": {},
  "chainId": 1,
  "txId": "0x123",
  "eventRaw": "raw event data"
}

```


## 11 validate DDO

### PolicyServer Endpoint Example
**Endpoint**: `http://localhost:3000/`

### PolicyServer Expected Payload Example

```json

 {
  "action":"updateDDO",
  "rawDDO": {},
  "chainId": 1,
  "txId": "0x123",
  "eventRaw": "raw event data"
}

```

## 12 passthrough

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
## Deploy .sh example
```
#!/bin/bash

IMAGE_NAME="ocean-policy-server"     
CONTAINER_NAME="ocean-policy-server" 
SERVER_USER="ubuntu"        
SERVER_IP=""  
#Route to ssh key
SSH_KEY=""
#Path where to store image
REMOTE_PATH=""   
LOCAL_PORT=8100                        
CONTAINER_PORT=8100                    

echo "Building docker image"
docker build -t $IMAGE_NAME:latest .

echo "Exporting docker build image..."
docker save -o ${IMAGE_NAME}.tar $IMAGE_NAME:latest

echo "Ziping docker image..."
gzip -f ${IMAGE_NAME}.tar

echo "Trasmiting to server..."
scp -i $SSH_KEY ${IMAGE_NAME}.tar.gz $SERVER_USER@$SERVER_IP:$REMOTE_PATH

echo "Runing commands on server..."
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP << EOF
  echo "unzip tar.gz..."
  gunzip -f ${REMOTE_PATH}/${IMAGE_NAME}.tar.gz

  echo "Importing docker..."
  docker load -i ${REMOTE_PATH}/${IMAGE_NAME}.tar

  echo "Deleting old container..."
  docker stop $CONTAINER_NAME || true
  docker rm $CONTAINER_NAME || true

  echo "Starting new container..."
  docker run -d \
    --name "$CONTAINER_NAME" \
    -p "$LOCAL_PORT:$CONTAINER_PORT" \
    -e PORT="$LOCAL_PORT" \
    -e AUTH_TYPE='waltid' \
    -e OCEAN_NODE_URL='http://ocean-node-vm1.oceanenterprise.io:8000' \
    -e WALTID_VERIFIER_URL='https://verifier.demo.walt.id' \
    -e WALTID_SUCCESS_REDIRECT_URL='https://example.com/success?id=\$id' \
    -e WALTID_ERROR_REDIRECT_URL='https://example.com/error?id=\$id' \
    -e ENABLE_LOGS='1' \
    -e MODE_PROXY='1' \
    -e MODE_PS='1' \
    -e WALTID_VERIFY_RESPONSE_REDIRECT_URL='http://ocean-node-vm2.oceanenterprise.io:8100/verify/\$id' \
    -e WALTID_VERIFY_PRESENTATION_DEFINITION_URL='http://ocean-node-vm2.oceanenterprise.io:8100/pd/\$id' \
    -e DEFAULT_VP_POLICIES='["expired","signature","revoked-status-list","not-before"]' \
    -e DEFAULT_VC_POLICIES='["expired","signature","revoked-status-list","not-before"]' \
    "$IMAGE_NAME:latest"


  echo "Deleting temp data..."
  rm -f ${REMOTE_PATH}/${IMAGE_NAME}.tar

  echo "Container is up!"
EOF

echo "Done!"

```