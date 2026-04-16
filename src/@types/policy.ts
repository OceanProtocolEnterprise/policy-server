export type PolicyRequestPayload = {
  action: string
  nodeAddress?: string
  consumerAddress?: string
  publisherAddress?: string
} & Record<PropertyKey, any>

export type PolicyRequestResponse = {
  success: boolean
  message?: any
  httpStatus: number
}
