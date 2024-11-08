import { AuthType } from '../../../@types/auth'
import { IPolicyHandler } from '../../../@types/policyHandler'
import {
  PolicyActionType,
  PolicyRequestPayload,
  PolicyRequestResponse
} from '../../../@types/request'

export class WaltIdNewDDOHandler implements IPolicyHandler {
  supportAuthType(authType: AuthType): boolean {
    return authType === 'waltid'
  }

  supportActionType(policyActionType: PolicyActionType): boolean {
    return policyActionType === 'newDDO'
  }

  execute(requestPayload: PolicyRequestPayload): PolicyRequestResponse {
    throw new Error('not implemented')
  }
}
