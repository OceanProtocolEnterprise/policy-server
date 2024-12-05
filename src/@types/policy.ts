export type PolicyRequestPayload = {
  action: string
} & Record<PropertyKey, any>

export type PolicyRequestResponse = {
  success: boolean
  message?: string
  httpStatus: number
}
