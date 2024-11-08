import { Container } from 'inversify'
import { TYPES } from '../../@types/containerTypes.js'
import { IPolicyHandler } from '../../@types/policyHandler.js'
import { WaltIdDownloadHandler } from './actions/downloadHandler.js'
import { WaltIdInitializeHandler } from './actions/initializeHandler.js'
import { WaltIdNewDDOHandler } from './actions/newDDOHandler.js'
import { WaltIdUpdateDDOHandler } from './actions/updateDDOHandler.js'
import { WaltIdDecryptHandler } from './actions/decryptHandler.js'
import { WaltIdEncryptHandler } from './actions/encryptHandler.js'
import { WaltIdPassThroughHandler } from './actions/passThroughHandler.js'

export function setupWaltIdBindings(container: Container) {
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(WaltIdInitializeHandler)
    .inSingletonScope()
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(WaltIdDownloadHandler)
    .inSingletonScope()
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(WaltIdNewDDOHandler)
    .inSingletonScope()
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(WaltIdUpdateDDOHandler)
    .inSingletonScope()
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(WaltIdDecryptHandler)
    .inSingletonScope()
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(WaltIdEncryptHandler)
    .inSingletonScope()
  container
    .bind<IPolicyHandler>(TYPES.IPolicyHandler)
    .to(WaltIdPassThroughHandler)
    .inSingletonScope()
}
