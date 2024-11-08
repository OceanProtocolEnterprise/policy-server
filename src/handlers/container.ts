import { Container } from 'inversify'
import { setupWaltIdBindings } from './waltid/waltidContainer.js'
import { setupLdapBindings } from './ldap/ldapContainer.js'
import { setupOauthBindings } from './oauth/oauthContainer.js'
const container = new Container()

setupWaltIdBindings(container)
setupLdapBindings(container)
setupOauthBindings(container)

export { container }
