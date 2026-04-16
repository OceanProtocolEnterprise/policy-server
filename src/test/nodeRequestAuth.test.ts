/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import request from 'supertest'
import sinon from 'sinon'
import axios from 'axios'
import { createApp } from '../index.js'
import {
  ConsumerRequestAuthenticator,
  EnvConsumerAccessListStore,
  EnvNodeAccessListStore,
  NodeRequestAuthenticator,
  PolicyRequestAuthenticator,
  type AccessListAuthorizer
} from '../utils/nodeRequestAuth.js'
import { PolicyHandlerFactory } from '../policyHandlerFactory.js'

const allowedNodeAddress = '0x1111111111111111111111111111111111111111'
const allowedConsumerAddress = '0x7777777777777777777777777777777777777777'

describe('Request authenticators', () => {
  const originalModePs = process.env.MODE_PS
  const originalPolicyApiKey = process.env.POLICY_SERVER_API_KEY
  const originalNodeAccessList = process.env.POLICY_SERVER_NODE_ACCESS_LIST
  const originalNodeAccessListUrl = process.env.POLICY_SERVER_NODE_ACCESS_LIST_URL
  const originalConsumerAccessList = process.env.POLICY_SERVER_CONSUMER_ACCESS_LIST
  const originalConsumerAccessListUrl = process.env.POLICY_SERVER_CONSUMER_ACCESS_LIST_URL
  const testPolicyApiKey = process.env.POLICY_SERVER_API_KEY ?? 'test-secret'
  let executeStub: sinon.SinonStub

  beforeEach(() => {
    process.env.MODE_PS = '1'
    process.env.POLICY_SERVER_API_KEY = testPolicyApiKey
    process.env.POLICY_SERVER_NODE_ACCESS_LIST = allowedNodeAddress
    process.env.POLICY_SERVER_NODE_ACCESS_LIST_URL = ''
    process.env.POLICY_SERVER_CONSUMER_ACCESS_LIST = allowedConsumerAddress
    process.env.POLICY_SERVER_CONSUMER_ACCESS_LIST_URL = ''
    EnvNodeAccessListStore.resetSharedFromEnvironment()
    EnvConsumerAccessListStore.resetSharedFromEnvironment()
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
    process.env.POLICY_SERVER_NODE_ACCESS_LIST_URL = originalNodeAccessListUrl
    process.env.POLICY_SERVER_CONSUMER_ACCESS_LIST = originalConsumerAccessList
    process.env.POLICY_SERVER_CONSUMER_ACCESS_LIST_URL = originalConsumerAccessListUrl
    EnvNodeAccessListStore.resetSharedFromEnvironment()
    EnvConsumerAccessListStore.resetSharedFromEnvironment()
  })

  it('allows a valid authorized node', async () => {
    const accessListAuthorizer: AccessListAuthorizer = {
      isAllowed: () => true
    }
    const authenticator = new NodeRequestAuthenticator(true, accessListAuthorizer)
    const app = createApp(authenticator)

    const response = await request(app)
      .post('/')
      .set('x-api-key', testPolicyApiKey)
      .send({ action: 'download', nodeAddress: allowedNodeAddress })

    expect(response.status).to.equal(200)
    expect(response.body.success).to.equal(true)
    expect(executeStub.calledOnce).to.equal(true)
  })

  it('rejects a valid node outside the access list', async () => {
    const accessListAuthorizer: AccessListAuthorizer = {
      isAllowed: () => false
    }
    const authenticator = new NodeRequestAuthenticator(true, accessListAuthorizer)
    const app = createApp(authenticator)

    const response = await request(app)
      .post('/')
      .set('x-api-key', testPolicyApiKey)
      .send({ action: 'download', nodeAddress: allowedNodeAddress })

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

    const response = await request(app)
      .post('/')
      .set('x-api-key', testPolicyApiKey)
      .send({ action: 'download', nodeAddress: 'not-an-address' })

    expect(response.status).to.equal(401)
    expect(response.body.message).to.equal('Invalid nodeAddress format.')
    expect(executeStub.called).to.equal(false)
  })

  it('rejects guarded actions when consumerAddress is missing', async () => {
    const nodeAccessListAuthorizer: AccessListAuthorizer = {
      isAllowed: () => true
    }
    const consumerAccessListAuthorizer: AccessListAuthorizer = {
      isAllowed: () => true
    }
    const authenticator = new PolicyRequestAuthenticator([
      new NodeRequestAuthenticator(true, nodeAccessListAuthorizer),
      new ConsumerRequestAuthenticator(true, consumerAccessListAuthorizer)
    ])
    const app = createApp(authenticator)

    const response = await request(app)
      .post('/')
      .set('x-api-key', testPolicyApiKey)
      .send({ action: 'encrypt', nodeAddress: allowedNodeAddress })

    expect(response.status).to.equal(401)
    expect(response.body.message).to.equal(
      'Missing consumer authorization fields. Expected consumerAddress.'
    )
    expect(executeStub.called).to.equal(false)
  })

  it('rejects validateDDO when publisherAddress is missing', async () => {
    const app = createApp()

    const response = await request(app)
      .post('/')
      .set('x-api-key', testPolicyApiKey)
      .send({ action: 'validateDDO', nodeAddress: allowedNodeAddress })

    expect(response.status).to.equal(401)
    expect(response.body.message).to.equal(
      'Missing consumer authorization fields. Expected publisherAddress.'
    )
    expect(executeStub.called).to.equal(false)
  })

  it('rejects download when consumerAddress is missing', async () => {
    const app = createApp()

    const response = await request(app)
      .post('/')
      .set('x-api-key', testPolicyApiKey)
      .send({ action: 'download', nodeAddress: allowedNodeAddress })

    expect(response.status).to.equal(401)
    expect(response.body.message).to.equal(
      'Missing consumer authorization fields. Expected consumerAddress.'
    )
    expect(executeStub.called).to.equal(false)
  })

  it('does not require consumerAddress for newDDO', async () => {
    const app = createApp()

    const response = await request(app)
      .post('/')
      .set('x-api-key', testPolicyApiKey)
      .send({
        action: 'newDDO',
        nodeAddress: allowedNodeAddress
      })

    expect(response.status).to.equal(200)
    expect(response.body.success).to.equal(true)
    expect(executeStub.calledOnce).to.equal(true)
  })

  it('does not require consumerAddress for checkSessionId', async () => {
    const app = createApp()

    const response = await request(app)
      .post('/')
      .set('x-api-key', testPolicyApiKey)
      .send({
        action: 'checkSessionId',
        nodeAddress: allowedNodeAddress,
        sessionId: 'test-session-id'
      })

    expect(response.status).to.equal(200)
    expect(response.body.success).to.equal(true)
    expect(executeStub.calledOnce).to.equal(true)
  })

  it('does not require consumerAddress for presentationRequest', async () => {
    const app = createApp()

    const response = await request(app)
      .post('/')
      .set('x-api-key', testPolicyApiKey)
      .send({
        action: 'presentationRequest',
        nodeAddress: allowedNodeAddress,
        sessionId: 'test-session-id'
      })

    expect(response.status).to.equal(200)
    expect(response.body.success).to.equal(true)
    expect(executeStub.calledOnce).to.equal(true)
  })

  it('rejects guarded actions when consumer is outside the access list', async () => {
    const app = createApp()

    const response = await request(app)
      .post('/')
      .set('x-api-key', testPolicyApiKey)
      .send({
        action: 'decrypt',
        nodeAddress: allowedNodeAddress,
        consumerAddress: '0x9999999999999999999999999999999999999999'
      })

    expect(response.status).to.equal(403)
    expect(response.body.message).to.include('Consumer')
    expect(executeStub.called).to.equal(false)
  })

  it('rejects validateDDO when publisher is outside the access list', async () => {
    const app = createApp()

    const response = await request(app)
      .post('/')
      .set('x-api-key', testPolicyApiKey)
      .send({
        action: 'validateDDO',
        nodeAddress: allowedNodeAddress,
        publisherAddress: '0x9999999999999999999999999999999999999999'
      })

    expect(response.status).to.equal(403)
    expect(response.body.message).to.include('Consumer')
    expect(executeStub.called).to.equal(false)
  })

  it('allows guarded actions when node and consumer are authorized', async () => {
    const app = createApp()

    const response = await request(app)
      .post('/')
      .set('x-api-key', testPolicyApiKey)
      .send({
        action: 'encrypt',
        nodeAddress: allowedNodeAddress,
        consumerAddress: allowedConsumerAddress
      })

    expect(response.status).to.equal(200)
    expect(response.body.success).to.equal(true)
    expect(executeStub.calledOnce).to.equal(true)
  })

  it('rejects initiate when consumer is outside the access list', async () => {
    const app = createApp()

    const response = await request(app)
      .post('/')
      .set('x-api-key', testPolicyApiKey)
      .send({
        action: 'initiate',
        nodeAddress: allowedNodeAddress,
        consumerAddress: '0x9999999999999999999999999999999999999999'
      })

    expect(response.status).to.equal(403)
    expect(response.body.message).to.include('Consumer')
    expect(executeStub.called).to.equal(false)
  })
})

describe('Accepted addresses management API', () => {
  const originalModePs = process.env.MODE_PS
  const originalAdminApiKey = process.env.ADMIN_API_KEY
  const originalNodeAccessList = process.env.POLICY_SERVER_NODE_ACCESS_LIST
  const originalNodeAccessListUrl = process.env.POLICY_SERVER_NODE_ACCESS_LIST_URL
  const originalConsumerAccessList = process.env.POLICY_SERVER_CONSUMER_ACCESS_LIST
  const originalConsumerAccessListUrl = process.env.POLICY_SERVER_CONSUMER_ACCESS_LIST_URL
  const testAdminApiKey = process.env.ADMIN_API_KEY ?? 'admin-secret'

  beforeEach(() => {
    process.env.MODE_PS = '1'
    process.env.ADMIN_API_KEY = testAdminApiKey
    process.env.POLICY_SERVER_NODE_ACCESS_LIST = allowedNodeAddress
    process.env.POLICY_SERVER_NODE_ACCESS_LIST_URL = ''
    process.env.POLICY_SERVER_CONSUMER_ACCESS_LIST = allowedConsumerAddress
    process.env.POLICY_SERVER_CONSUMER_ACCESS_LIST_URL = ''
    EnvNodeAccessListStore.resetSharedFromEnvironment()
    EnvConsumerAccessListStore.resetSharedFromEnvironment()
  })

  afterEach(() => {
    sinon.restore()
    process.env.MODE_PS = originalModePs
    process.env.ADMIN_API_KEY = originalAdminApiKey
    process.env.POLICY_SERVER_NODE_ACCESS_LIST = originalNodeAccessList
    process.env.POLICY_SERVER_NODE_ACCESS_LIST_URL = originalNodeAccessListUrl
    process.env.POLICY_SERVER_CONSUMER_ACCESS_LIST = originalConsumerAccessList
    process.env.POLICY_SERVER_CONSUMER_ACCESS_LIST_URL = originalConsumerAccessListUrl
    EnvNodeAccessListStore.resetSharedFromEnvironment()
    EnvConsumerAccessListStore.resetSharedFromEnvironment()
  })

  it('returns the current accepted node list', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/listAcceptedNodes')
      .set('x-api-key', testAdminApiKey)

    expect(response.status).to.equal(200)
    expect(response.body.enabled).to.equal(true)
    expect(response.body.addresses).to.deep.equal([allowedNodeAddress])
  })

  it('returns the current accepted consumer list', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/listAcceptedConsumers')
      .set('x-api-key', testAdminApiKey)

    expect(response.status).to.equal(200)
    expect(response.body.enabled).to.equal(true)
    expect(response.body.addresses).to.deep.equal([allowedConsumerAddress])
  })

  it('reloads accepted nodes from env and URL', async () => {
    process.env.POLICY_SERVER_NODE_ACCESS_LIST =
      '0x2222222222222222222222222222222222222222'
    process.env.POLICY_SERVER_NODE_ACCESS_LIST_URL = 'https://example.com/nodes.txt'
    sinon
      .stub(axios, 'get')
      .resolves({ data: '0x3333333333333333333333333333333333333333\n' } as any)

    const app = createApp()
    const response = await request(app)
      .post('/reloadAcceptedNodes')
      .set('x-api-key', testAdminApiKey)

    expect(response.status).to.equal(200)
    expect(response.body.addresses).to.deep.equal([
      '0x2222222222222222222222222222222222222222',
      '0x3333333333333333333333333333333333333333'
    ])
  })

  it('reloads accepted consumers from env and URL', async () => {
    process.env.POLICY_SERVER_CONSUMER_ACCESS_LIST =
      '0x8888888888888888888888888888888888888888'
    process.env.POLICY_SERVER_CONSUMER_ACCESS_LIST_URL =
      'https://example.com/consumers.txt'
    sinon
      .stub(axios, 'get')
      .resolves({ data: '0x9999999999999999999999999999999999999999\n' } as any)

    const app = createApp()
    const response = await request(app)
      .post('/reloadAcceptedConsumers')
      .set('x-api-key', testAdminApiKey)

    expect(response.status).to.equal(200)
    expect(response.body.addresses).to.deep.equal([
      '0x8888888888888888888888888888888888888888',
      '0x9999999999999999999999999999999999999999'
    ])
  })

  it('rejects administrative endpoints with an invalid API key', async () => {
    const app = createApp()

    const response = await request(app)
      .get('/listAcceptedNodes')
      .set('x-api-key', 'wrong-key')

    expect(response.status).to.equal(401)
    expect(response.body.message).to.equal('Unauthorized')
  })
})
