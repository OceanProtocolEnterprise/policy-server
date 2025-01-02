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

  it('should call initialize with valid payload', async () => {
    const payload = {
      action: 'initialize',
      ddo: {
        credentialSubject: {
          credentials: [
            {
              allow: [
                {
                  vpPolicies: ['signature', 'expired'],
                  vcPolicies: ['signature', 'expired'],
                  requestCredentials: [
                    {
                      type: 'VerifiableId',
                      format: 'jwt_vc_json'
                    },
                    {
                      type: 'OpenBadgeCredential',
                      format: 'jwt_vc_json',
                      policies: [
                        'signature',
                        {
                          policy: 'webhook',
                          args: 'https://example.org/abc/xyz'
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

    const stub = sinon.stub(axios, 'post').resolves({ status: 200, data: 'success' })

    const response = await handler.initialize(payload as any)
    expect(stub.calledOnce).to.be.equal(true)
    expect(response.success).to.be.equal(true)
    expect(response.message).to.equal('success')
  })

  it('should return error for invalid payload in initialize', async () => {
    const payload = { ddo: {} }

    const response = await handler.initialize(payload as any)
    expect(response.success).to.be.equal(false)
    expect(response.message).to.include(
      'Request body does not contain ddo.credentialSubject'
    )
  })
  it('should call download with valid payload', async () => {
    const payload = {
      policyServer: {
        sessionId: 'session123'
      }
    }

    const stub = sinon.stub(axios, 'get').resolves({
      status: 200,
      data: { session: 'data' }
    })

    const response = await handler.download(payload as any)

    expect(stub.calledOnce).to.be.equal(true)
    expect(
      stub.calledWith(
        `${process.env.WALTID_VERIFIER_URL}/openid4vc/session/${payload.policyServer.sessionId}`
      )
    ).to.be.equal(true)
    expect(response.success).to.be.equal(true)
    expect(response.message).to.deep.equal({ session: 'data' })
    expect(response.httpStatus).to.be.equal(200)
  })

  it('should return error for invalid payload in download', async () => {
    const payload = {
      policyServer: {}
    }

    const response = await handler.download(payload as any)

    expect(response.success).to.be.equal(false)
    expect(response.message).to.include(
      'Request body does not contain policyServer.sessionId'
    )
  })
})
