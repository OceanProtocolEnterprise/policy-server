import { expect } from 'chai'
import { WaltIdPolicyHandler } from '../handlers/waltIdPolicyHandler.js'
import { PolicyHandlerFactory } from '../policyHandlerFactory.js'

describe('PolicyHandlerFactory', () => {
  it('should return WaltIdPolicyHandler for authType "waltid"', () => {
    const handler = PolicyHandlerFactory.createPolicyHandler('waltid')
    expect(handler).to.be.an.instanceof(WaltIdPolicyHandler)
  })

  it('should return null for unknown authType', () => {
    const handler = PolicyHandlerFactory.createPolicyHandler('unknown')

    expect(handler).to.equal(null)
  })
})
