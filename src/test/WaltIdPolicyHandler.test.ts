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
      ddo: {
        credentialSubject: {
          credentials: [
            {
              allow: [
                {
                  vpPolicies: ['signature'],
                  vcPolicies: ['signature'],
                  requestCredentials: [
                    {
                      type: 'VerifiableId',
                      format: 'jwt_vc_json'
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

    const response = await handler.initiate(payload as any)

    expect(stub.calledOnce).to.be.true
    expect(response.success).to.be.true
    expect(response.message).to.equal('success')
    expect(response.httpStatus).to.equal(200)
  })

  it('should return error for invalid payload in initiate', async () => {
    const payload = { ddo: {} }

    const response = await handler.initiate(payload as any)

    expect(response.success).to.be.false
    expect(response.message).to.include(
      'Request body does not contain ddo.credentialSubject'
    )
  })

  it('should call presentationRequest with valid payload', async () => {
    const payload = {
      policyServer: {
        sessionId: 'session123',
        vp_token: 'token123',
        response: 'response123',
        presentation_submission: 'submission123'
      }
    }

    const stub = sinon.stub(axios, 'post').resolves({ status: 200, data: 'success' })

    const response = await handler.presentationRequest(payload as any)

    expect(stub.calledOnce).to.be.true
    expect(response.httpStatus).to.equal(200)
  })

  it('should return error for invalid payload in presentationRequest', async () => {
    const payload = { policyServer: {} }

    const response = await handler.presentationRequest(payload as any)

    expect(response.success).to.be.false
    expect(response.message).to.include(
      'Request body does not contain policyServer.sessionId'
    )
  })

  it('should call checkSessionId with valid payload', async () => {
    const payload = {
      policyServer: {
        sessionId: 'session123'
      }
    }

    const stub = sinon.stub(axios, 'get').resolves({ status: 200, data: 'sessionData' })

    const response = await handler.checkSessionId(payload as any)

    expect(stub.calledOnce).to.be.true
    expect(response.httpStatus).to.equal(200)
  })

  it('should return error for invalid payload in checkSessionId', async () => {
    const payload = { policyServer: {} }

    const response = await handler.checkSessionId(payload as any)

    expect(response.success).to.be.false
    expect(response.message).to.include(
      'Request body does not contain policyServer.sessionId'
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
      data: { verificationResult: true }
    })

    const response = await handler.download(payload as any)

    expect(stub.calledOnce).to.be.true
    expect(response.success).to.be.true
    expect(response.message).to.deep.equal({ verificationResult: true })
    expect(response.httpStatus).to.equal(200)
  })

  it('should return error for invalid payload in download', async () => {
    const payload = { policyServer: {} }

    const response = await handler.download(payload as any)

    expect(response.success).to.be.false
    expect(response.message).to.include(
      'Request body does not contain policyServer.sessionId'
    )
  })

  it('should return error for invalid payload in passthrough', async () => {
    const payload = { httpMethod: 'POST' }

    const response = await handler.passthrough(payload as any)

    expect(response.success).to.be.false
    expect(response.message).to.include('Request body does not contain url')
  })
})
