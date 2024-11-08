import { AuthType } from './auth'
import { PolicyActionType, PolicyRequestPayload, PolicyRequestResponse } from './request'

export interface IPolicyHandler {
  supportAuthType: (authType: AuthType) => boolean
  supportActionType: (policyActionType: PolicyActionType) => boolean
  execute: (requestPayload: PolicyRequestPayload) => PolicyRequestResponse
}
