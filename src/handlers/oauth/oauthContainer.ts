import { Container } from 'inversify'
import { TYPES } from '../../@types/PolicyServer/containerTypes.js'
import { IPolicyHandler } from '../../@types/PolicyServer/policyHandler.js'
import { OauthDecryptHandler } from './actions/decryptHandler.js'
import { OauthDownloadHandler } from './actions/downloadHandler.js'
import { OauthEncryptHandler } from './actions/encryptHandler.js'
import { OauthInitializeHandler } from './actions/initializeHandler.js'
import { OauthNewDDOHandler } from './actions/newDDOHandler.js'
import { OauthPassThroughHandler } from './actions/passThroughHandler.js'
import { OauthUpdateDDOHandler } from './actions/updateDDOHandler.js'

export function setupOauthBindings(container: Container) {
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(OauthInitializeHandler)
    .inSingletonScope()
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(OauthDownloadHandler)
    .inSingletonScope()
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(OauthNewDDOHandler)
    .inSingletonScope()
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(OauthUpdateDDOHandler)
    .inSingletonScope()
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(OauthDecryptHandler)
    .inSingletonScope()
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(OauthEncryptHandler)
    .inSingletonScope()
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(OauthPassThroughHandler)
    .inSingletonScope()
}
