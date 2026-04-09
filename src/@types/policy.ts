export type PolicyRequestPayload = {
  action: string
  nodeAddress?: string
  consumerAddress?: string
} & Record<PropertyKey, any>

export type PolicyRequestResponse = {
  success: boolean
  message?: any
  httpStatus: number
}
