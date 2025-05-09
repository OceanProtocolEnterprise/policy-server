/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import sinon from 'sinon'
import axios from 'axios'
import { WaltIdPolicyHandler } from '../handlers/waltIdPolicyHandler.js'

describe('WaltIdPolicyHandler', () => {
  let handler: WaltIdPolicyHandler

  beforeEach(() => {
    handler = new WaltIdPolicyHandler()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should call initiate with valid payload', async () => {
    const payload = {
      action: 'initiate',
      sessionId: '',
      serviceId: 'ff294c2e2c7d01bd5f9701abc117737917bb1f91044ba6b2d0903fc806db0d65',
      consumerAddress: '0xd727fb9be39fa019d7c02fea19e54d688da3a662',
      policyServer: {
        successRedirectUri: '',
        errorRedirectUri: '',
        responseRedirectUri: '',
        presentationDefinitionUri: ''
      },
      ddo: {
        '@context': ['https://www.w3.org/ns/credentials/v2'],
        id: 'did:ope:1ec8435672854acf15ef3e61216900f314f8fae5e04e6b2fb0dc91c0579e0d02',
        version: '5.0.0',
        credentialSubject: {
          credentials: {
            allow: [
              {
                values: [
                  {
                    request_credentials: [
                      {
                        format: 'jwt_vc_json',
                        policies: [] as any[],
                        type: 'UniversityDegree'
                      }
                    ],
                    vc_policies: ['signature', 'not-before', 'revoked-status-list'],
                    vp_policies: [] as any[]
                  }
                ],
                type: 'SSIpolicy'
              },
              {
                values: ['*'],
                type: 'address'
              }
            ],
            deny: [] as any[],
            match_deny: 'any'
          },
          chainId: 11155111,
          metadata: {
            created: '2025-04-15T19:48:54Z',
            updated: '2025-04-15T19:48:54Z',
            type: 'dataset',
            name: 'Test data set with SSI credentials - 8',
            description: {
              '@value':
                'Test data set with SSI credentials - 8\n\nAccess to the asset allowed to UniversityDegree holders.',
              '@direction': '',
              '@language': ''
            },
            tags: ['test'],
            author: '',
            license: {
              name: 'https://github.com/MBadea17/testdata/blob/af26d4f968fdb6e1882c2a3cca16a1480ca44a9c/License%20Agreement.pdf',
              licenseDocuments: [
                {
                  sha256:
                    '7939fa7e4201a373a3471feccd878c026cad50cc7d4308b6849741782b0691f7',
                  mirrors: [
                    {
                      method: 'get',
                      type: 'url',
                      url: 'https://github.com/MBadea17/testdata/blob/af26d4f968fdb6e1882c2a3cca16a1480ca44a9c/License%20Agreement.pdf'
                    }
                  ],
                  name: 'https://github.com/MBadea17/testdata/blob/af26d4f968fdb6e1882c2a3cca16a1480ca44a9c/License%20Agreement.pdf',
                  fileType: 'text/html; charset=utf-8'
                }
              ]
            },
            links: {},
            additionalInformation: {
              termsAndConditions: true
            },
            copyrightHolder: '',
            providedBy: ''
          },
          services: [
            {
              credentials: {
                allow: [
                  {
                    values: [
                      {
                        request_credentials: [] as any[],
                        vc_policies: ['signature', 'not-before', 'revoked-status-list'],
                        vp_policies: [] as any[]
                      }
                    ],
                    type: 'SSIpolicy'
                  },
                  {
                    values: ['0xd727fb9be39fa019d7c02fea19e54d688da3a662'],
                    type: 'address'
                  }
                ],
                match_deny: 'any',
                deny: [] as any[]
              },
              name: 'Service 1',
              files:
                '0x048d5a53cfc89686e6cde36df81495a3eda3c42044240254fbd7b93e7e11b1272e867e448a64d639d490bdbb9f3a45be4d0a54d53a3b92317c57ca270899dc29b97d3f0fe6fba6a40d3d9ff1438bf8c36732af3b47c4056486e8fcd7dcddba2038bce7fb24ec4e28ae889a4556e61dbeda5344a102d60c88dfbc1fe84e983a0d360c269705071c9191f982c832c93b39d91c688787af4d55b55e5afb38e0ad8eb5d92bd7a51935daa8d4e394436b6f911883516c7f3c875753673acab80859664f5dde7ce7279d7948c5987271989aacd261751cb933e454919f0cd4f1e075e0d138c5425a4fae3e1046b7fdbe8aec7b29bacac922a01f3b37203b67c0ac0a246ac0b0acdb2b5d21c1723daeae63555847c0e9e4b54f9bad995ba8b9098616f82b5a89d9c21fbac07035530a6010ca9ccc94f7474397701b8df23496206402d670cebd2964a8b4a0f45039cf3519b4ce30ae5b0744b22a5ceb5e9db0a8c8431d19356f9284cac87da509da54bc85b1811878bd72de38adbad9b9945a1cf6272d5ed877e498a1',
              description: {
                '@value':
                  'Service accessible to address 0xD727FB9Be39fA019d7C02fea19E54d688Da3a662',
                '@direction': '',
                '@language': ''
              },
              id: '7b2ca00f457ecc21eff766d39f2f35e1ee5e5d427eb3f62aa7297080388eeff6',
              datatokenAddress: '0x879A899d5DCDa773e3cD8188Af45eAf7194c24d2',
              serviceEndpoint: 'https://ocean-node-vm3.oceanenterprise.io',
              state: 0,
              type: 'access',
              timeout: 0
            },
            {
              credentials: {
                allow: [
                  {
                    values: [
                      {
                        request_credentials: [
                          {
                            format: 'jwt_vc_json',
                            policies: [],
                            type: 'VerifiableId'
                          }
                        ],
                        vc_policies: ['signature', 'not-before', 'revoked-status-list'],
                        vp_policies: []
                      }
                    ],
                    type: 'SSIpolicy'
                  }
                ],
                match_deny: 'any',
                deny: []
              },
              name: 'Service 2',
              description: {
                '@value': 'Service accessible to holder of VerifiableId credentials',
                '@direction': '',
                '@language': ''
              },
              files: '...',
              id: 'ff294c2e2c7d01bd5f9701abc117737917bb1f91044ba6b2d0903fc806db0d65',
              datatokenAddress: '0x18945267E5C9f56f9626206711a31afaCea4Ae6B',
              serviceEndpoint: 'https://ocean-node-vm3.oceanenterprise.io',
              state: 0,
              type: 'access',
              timeout: 86400
            }
          ],
          nftAddress: '0x09e939308A16e1B27088bbf6932D91EC8b5F42b8',
          nft: {
            state: 0,
            address: '0x09e939308A16e1B27088bbf6932D91EC8b5F42b8',
            name: 'Data NFT',
            symbol: 'OEC-NFT',
            owner: '0x00Dc9e712D3b31Ab5446A5A7CeaDe0a2901E6d26',
            created: '2025-04-15T19:59:24Z',
            tokenURI: ''
          }
        },
        additionalDdos: [] as any[],
        type: ['VerifiableCredential'],
        issuer: 'did:jwk:eyJrdHkiOiJPS1Ai...',
        proof: {
          signature:
            'N2GQRLQbDUM7gLlUNweF-JjP9XS1uAWHWZy-8NLdlBdPJFrdvVkZk1z6UntVqATkCZU-l8MMQP_5DyMDzws3DA',
          header: {
            kid: '5M-hw_Im6CjRCgsBUxF_DvilQFx_uU9EjMqJOo7P8Dg',
            alg: 'EdDSA'
          }
        },
        accessDetails: [
          {
            type: 'fixed',
            price: '2.0',
            addressOrId: '...',
            baseToken: {
              address: '0x1B083D8584dd3e6Ff37d04a6e7e82b5F622f3985',
              name: 'Ocean Token',
              symbol: 'OCEAN',
              decimals: 18
            },
            datatoken: {
              address: '...',
              name: 'Access Token',
              symbol: 'OEAT',
              decimals: 0
            },
            paymentCollector: '0x00Dc9e712D3b31Ab5446A5A7CeaDe0a2901E6d26',
            templateId: 2,
            isOwned: false,
            validOrderTx: '',
            isPurchasable: true,
            publisherMarketOrderFee: '0'
          }
        ]
      }
    }

    const stub = sinon.stub(axios, 'post').resolves({ status: 200, data: 'success' })

    const response = await handler.initiate(payload as any)
    console.log(JSON.stringify(response))
    expect(stub.calledOnce).to.be.true
    expect(response.success).to.be.true
    expect(response.message).to.equal('success')
    expect(response.httpStatus).to.equal(200)
  })

  it('should call presentationRequest with valid payload', async () => {
    const payload = {
      sessionId: 'session123',
      vp_token: 'token123',
      response: 'response123',
      presentation_submission: 'submission123'
    }

    const stub = sinon.stub(axios, 'post').resolves({ status: 200, data: 'success' })

    const response = await handler.presentationRequest(payload as any)

    expect(stub.calledOnce).to.be.true
    expect(response.httpStatus).to.equal(200)
  })

  it('should return error for invalid payload in presentationRequest', async () => {
    const payload = {}

    const response = await handler.presentationRequest(payload as any)

    expect(response.success).to.be.false
    expect(response.message).to.include('Request body does not contain sessionId')
  })

  it('should return error for invalid payload in checkSessionId', async () => {
    const payload = {}

    const response = await handler.checkSessionId(payload as any)

    expect(response.success).to.be.false
    expect(response.message).to.include('Request body does not contain sessionId')
  })

  it('should return error for invalid payload in passthrough', async () => {
    const payload = { httpMethod: 'POST' }

    const response = await handler.passthrough(payload as any)

    expect(response.success).to.be.false
    expect(response.message).to.include('Request body does not contain url')
  })
})
