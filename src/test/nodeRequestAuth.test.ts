/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import request from 'supertest'
import sinon from 'sinon'
import { createApp } from '../index.js'
import {
  ConsumerRequestAuthenticator,
  EnvConsumerAccessListStore,
  EnvNodeAccessListStore,
  NodeRequestAuthenticator,
  type AccessListAuthorizer
} from '../utils/nodeRequestAuth.js'
import { PolicyHandlerFactory } from '../policyHandlerFactory.js'

const allowedNodeAddress = '0x1111111111111111111111111111111111111111'
const allowedConsumerAddress = '0x3333333333333333333333333333333333333333'

describe('NodeRequestAuthenticator', () => {
  const originalModePs = process.env.MODE_PS
  const originalPolicyApiKey = process.env.POLICY_SERVER_API_KEY
  const originalNodeAccessList = process.env.POLICY_SERVER_NODE_ACCESS_LIST
  const testPolicyApiKey = process.env.POLICY_SERVER_API_KEY ?? 'test-secret'
  let executeStub: sinon.SinonStub

  beforeEach(() => {
    process.env.MODE_PS = '1'
    process.env.POLICY_SERVER_API_KEY = testPolicyApiKey
    process.env.POLICY_SERVER_NODE_ACCESS_LIST = allowedNodeAddress
    EnvNodeAccessListStore.resetSharedFromEnvironment()
    executeStub = sinon.stub().resolves({
      success: true,
      httpStatus: 200,
      message: 'ok'
    })
    sinon
      .stub(PolicyHandlerFactory, 'createPolicyHandler')
      .returns({ execute: executeStub } as any)
  })

  afterEach(() => {
    sinon.restore()
    process.env.MODE_PS = originalModePs
    process.env.POLICY_SERVER_API_KEY = originalPolicyApiKey
    process.env.POLICY_SERVER_NODE_ACCESS_LIST = originalNodeAccessList
    EnvNodeAccessListStore.resetSharedFromEnvironment()
  })

  it('allows a valid authorized node', async () => {
    const accessListAuthorizer: AccessListAuthorizer = {
      isAllowed: () => true
    }
    const authenticator = new NodeRequestAuthenticator(true, accessListAuthorizer)
    const app = createApp(authenticator)
    const payload = { action: 'download', nodeAddress: allowedNodeAddress }

    const response = await request(app)
      .post('/')
      .set('x-api-key', testPolicyApiKey)
      .send(payload)

    expect(response.status).to.equal(200)
    expect(response.body.success).to.equal(true)
    expect(executeStub.calledOnce).to.equal(true)
  })

  it('rejects a valid signature for a node outside the access list', async () => {
    const accessListAuthorizer: AccessListAuthorizer = {
      isAllowed: () => false
    }
    const authenticator = new NodeRequestAuthenticator(true, accessListAuthorizer)
    const app = createApp(authenticator)
    const payload = { action: 'download', nodeAddress: allowedNodeAddress }

    const response = await request(app)
      .post('/')
      .set('x-api-key', testPolicyApiKey)
      .send(payload)

    expect(response.status).to.equal(403)
    expect(response.body.message).to.include('not authorized')
    expect(executeStub.called).to.equal(false)
  })

  it('rejects an invalid node address', async () => {
    const accessListAuthorizer: AccessListAuthorizer = {
      isAllowed: () => true
    }
    const authenticator = new NodeRequestAuthenticator(true, accessListAuthorizer)
    const app = createApp(authenticator)
    const payload = { action: 'download', nodeAddress: 'not-an-address' }

    const response = await request(app)
      .post('/')
      .set('x-api-key', testPolicyApiKey)
      .send(payload)

    expect(response.status).to.equal(401)
    expect(response.body.message).to.equal('Invalid nodeAddress format.')
    expect(executeStub.called).to.equal(false)
  })

  it('rejects requests with missing auth fields', async () => {
    const accessListAuthorizer: AccessListAuthorizer = {
      isAllowed: () => true
    }
    const authenticator = new NodeRequestAuthenticator(true, accessListAuthorizer)
    const app = createApp(authenticator)

    const response = await request(app)
      .post('/')
      .set('x-api-key', testPolicyApiKey)
      .send({ action: 'download' })

    expect(response.status).to.equal(401)
    expect(response.body.message).to.include('Missing node authorization fields')
    expect(executeStub.called).to.equal(false)
  })
})

describe('ConsumerRequestAuthenticator', () => {
  it('allows an authorized consumer', async () => {
    const accessListAuthorizer: AccessListAuthorizer = {
      isAllowed: () => true
    }
    const authenticator = new ConsumerRequestAuthenticator(true, accessListAuthorizer)

    const response =
      await authenticator.authenticateConsumerAddress(allowedConsumerAddress)

    expect(response).to.equal(null)
  })

  it('rejects an invalid consumer address', async () => {
    const accessListAuthorizer: AccessListAuthorizer = {
      isAllowed: () => true
    }
    const authenticator = new ConsumerRequestAuthenticator(true, accessListAuthorizer)

    const response = await authenticator.authenticateConsumerAddress('not-an-address')

    expect(response?.httpStatus).to.equal(401)
    expect(response?.message).to.equal('Invalid consumerAddress format.')
  })

  it('rejects a consumer outside the access list', async () => {
    const accessListAuthorizer: AccessListAuthorizer = {
      isAllowed: () => false
    }
    const authenticator = new ConsumerRequestAuthenticator(true, accessListAuthorizer)

    const response =
      await authenticator.authenticateConsumerAddress(allowedConsumerAddress)

    expect(response?.httpStatus).to.equal(403)
    expect(response?.message).to.include('not authorized')
  })
})

describe('Node access list management API', () => {
  const originalModePs = process.env.MODE_PS
  const originalAccessListApiKey = process.env.POLICY_SERVER_ACCESS_LIST_API_KEY
  const originalNodeAccessList = process.env.POLICY_SERVER_NODE_ACCESS_LIST
  const originalConsumerAccessList = process.env.POLICY_SERVER_CONSUMER_ACCESS_LIST
  const testAccessListApiKey =
    process.env.POLICY_SERVER_ACCESS_LIST_API_KEY ?? 'list-secret'

  beforeEach(() => {
    process.env.MODE_PS = '1'
    process.env.POLICY_SERVER_ACCESS_LIST_API_KEY = testAccessListApiKey
    process.env.POLICY_SERVER_NODE_ACCESS_LIST =
      '0x1111111111111111111111111111111111111111'
    process.env.POLICY_SERVER_CONSUMER_ACCESS_LIST =
      '0x3333333333333333333333333333333333333333'
    EnvNodeAccessListStore.resetSharedFromEnvironment()
    EnvConsumerAccessListStore.resetSharedFromEnvironment()
  })

  afterEach(() => {
    process.env.MODE_PS = originalModePs
    process.env.POLICY_SERVER_ACCESS_LIST_API_KEY = originalAccessListApiKey
    process.env.POLICY_SERVER_NODE_ACCESS_LIST = originalNodeAccessList
    process.env.POLICY_SERVER_CONSUMER_ACCESS_LIST = originalConsumerAccessList
    EnvNodeAccessListStore.resetSharedFromEnvironment()
    EnvConsumerAccessListStore.resetSharedFromEnvironment()
  })

  it('returns the current access list', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/node-access-list')
      .set('x-api-key', testAccessListApiKey)

    expect(response.status).to.equal(200)
    expect(response.body.addresses).to.deep.equal([
      '0x1111111111111111111111111111111111111111'
    ])
  })

  it('updates the access list', async () => {
    const app = createApp()

    const response = await request(app)
      .post('/node-access-list')
      .set('x-api-key', testAccessListApiKey)
      .send({
        addresses: ['0x2222222222222222222222222222222222222222']
      })

    expect(response.status).to.equal(200)
    expect(response.body.addresses).to.deep.equal([
      '0x2222222222222222222222222222222222222222'
    ])
    expect(process.env.POLICY_SERVER_NODE_ACCESS_LIST).to.equal(
      '0x2222222222222222222222222222222222222222'
    )
  })

  it('applies updated access list entries to subsequent policy requests', async () => {
    const originalPolicyApiKey = process.env.POLICY_SERVER_API_KEY
    process.env.POLICY_SERVER_API_KEY = 'test-secret'
    const app = createApp()

    await request(app)
      .post('/node-access-list')
      .set('x-api-key', testAccessListApiKey)
      .send({
        addresses: ['0x2222222222222222222222222222222222222222']
      })

    const executeStub = sinon.stub().resolves({
      success: true,
      httpStatus: 200,
      message: 'ok'
    })
    sinon
      .stub(PolicyHandlerFactory, 'createPolicyHandler')
      .returns({ execute: executeStub } as any)

    const response = await request(app).post('/').set('x-api-key', 'test-secret').send({
      action: 'download',
      nodeAddress: '0x2222222222222222222222222222222222222222'
    })

    expect(response.status).to.equal(200)
    expect(executeStub.calledOnce).to.equal(true)

    sinon.restore()
    process.env.POLICY_SERVER_API_KEY = originalPolicyApiKey
  })

  it('rejects invalid access list payloads', async () => {
    const app = createApp()

    const response = await request(app)
      .post('/node-access-list')
      .set('x-api-key', testAccessListApiKey)
      .send({
        addresses: ['not-an-address']
      })

    expect(response.status).to.equal(400)
    expect(response.body.message).to.equal('Invalid Ethereum address in access list.')
  })

  it('accepts an empty access list update', async () => {
    const app = createApp()

    const response = await request(app)
      .post('/node-access-list')
      .set('x-api-key', testAccessListApiKey)
      .send({
        addresses: []
      })

    expect(response.status).to.equal(200)
    expect(response.body.addresses).to.deep.equal([])
    expect(process.env.POLICY_SERVER_NODE_ACCESS_LIST).to.equal('')
  })

  it('returns the current consumer access list', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/consumer-access-list')
      .set('x-api-key', testAccessListApiKey)

    expect(response.status).to.equal(200)
    expect(response.body.addresses).to.deep.equal([
      '0x3333333333333333333333333333333333333333'
    ])
  })

  it('updates the consumer access list', async () => {
    const app = createApp()

    const response = await request(app)
      .post('/consumer-access-list')
      .set('x-api-key', testAccessListApiKey)
      .send({
        addresses: ['0x4444444444444444444444444444444444444444']
      })

    expect(response.status).to.equal(200)
    expect(response.body.addresses).to.deep.equal([
      '0x4444444444444444444444444444444444444444'
    ])
    expect(process.env.POLICY_SERVER_CONSUMER_ACCESS_LIST).to.equal(
      '0x4444444444444444444444444444444444444444'
    )
  })
})
