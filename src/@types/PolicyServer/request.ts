export type PolicyActionType =
  | 'newDDO'
  | 'updateDDO'
  | 'initialize'
  | 'download'
  | 'encrypt'
  | 'decrypt'
  | 'passthrough'
  | 'upload'

export type PolicyRequestPayload = {
  action: PolicyActionType
} & Record<PropertyKey, any>
export type PolicyRequestResponse = {
  success: boolean
  message?: string
  httpStatus: number
}
