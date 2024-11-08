import { Container } from 'inversify'
import { TYPES } from '../../@types/containerTypes.js'
import { IPolicyHandler } from '../../@types/policyHandler.js'
import { LdapDecryptHandler } from './actions/decryptHandler.js'
import { LdapDownloadHandler } from './actions/downloadHandler.js'
import { LdapEncryptHandler } from './actions/encryptHandler.js'
import { LdapInitializeHandler } from './actions/initializeHandler.js'
import { LdapNewDDOHandler } from './actions/newDDOHandler.js'
import { LdapPassThroughHandler } from './actions/passThroughHandler.js'
import { LdapUpdateDDOHandler } from './actions/updateDDOHandler.js'

export function setupLdapBindings(container: Container) {
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(LdapInitializeHandler)
    .inSingletonScope()
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(LdapDownloadHandler)
    .inSingletonScope()
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(LdapNewDDOHandler)
    .inSingletonScope()
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(LdapUpdateDDOHandler)
    .inSingletonScope()
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(LdapDecryptHandler)
    .inSingletonScope()
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(LdapEncryptHandler)
    .inSingletonScope()
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(LdapPassThroughHandler)
    .inSingletonScope()
}
