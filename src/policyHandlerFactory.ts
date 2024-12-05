import { LDAPPolicyHandler } from './handlers/ldapPolicyHandler.js'
import { OAuthPolicyHandler } from './handlers/oauthPolicyHandler.js'
import { WaltIdPolicyHandler } from './handlers/waltIdPolicyHandler.js'
import { PolicyHandler } from './policyHandler.js'

export class PolicyHandlerFactory {
  private static registry: { [key: string]: new () => PolicyHandler } = {
    waltid: WaltIdPolicyHandler,
    ldap: LDAPPolicyHandler,
    oauth: OAuthPolicyHandler
  }

  static createPolicyHandler(authType: string): PolicyHandler {
    const PolicyHandler = this.registry[authType]
    return new PolicyHandler()
  }
}
