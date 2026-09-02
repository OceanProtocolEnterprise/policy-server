import { expect } from 'chai'
import { PolicyHandler } from '../policyHandler.js'

describe('PolicyHandler', () => {
  const originalOpaServer = process.env.OPA_SERVER

  afterEach(() => {
    if (originalOpaServer === undefined) delete process.env.OPA_SERVER
    else process.env.OPA_SERVER = originalOpaServer
  })

  it('returns the configured OPA server URL', async () => {
    process.env.OPA_SERVER = 'https://opa.example.com'
    const handler = new PolicyHandler()

    const response = await handler.execute({ action: 'getOpaServerUrl' })

    expect(response).to.deep.equal({
      success: true,
      message: 'https://opa.example.com',
      httpStatus: 200
    })
  })

  it('returns null when the OPA server URL is not configured', async () => {
    delete process.env.OPA_SERVER
    const handler = new PolicyHandler()

    const response = await handler.execute({ action: 'getOpaServerUrl' })

    expect(response).to.deep.equal({
      success: true,
      message: null,
      httpStatus: 200
    })
  })
})
