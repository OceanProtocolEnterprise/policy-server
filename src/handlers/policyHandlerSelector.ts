import {
  AuthType,
  IPolicyHandler,
  PolicyActionType
} from '../@types/PolicyServer/policyServerTypes'

export class PolicyHandlerSelector {
  private handlers: IPolicyHandler[]

  constructor(handlers: IPolicyHandler[]) {
    this.handlers = handlers
  }

  selectHandler(authType: AuthType, actionType: PolicyActionType): IPolicyHandler | null {
    return (
      this.handlers.find(
        (handler) =>
          handler.supportAuthType(authType) && handler.supportActionType(actionType)
      ) || null
    )
  }
}
