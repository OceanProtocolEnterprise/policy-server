export function parseRequestCredentials(requestPayload: any): any {
  const credentials = requestPayload?.ddo?.credentials

  if (!credentials || !credentials.allow || credentials.allow.length === 0) {
    console.warn("No 'allow' found in credentials.")
    return {
      vp_policies: [],
      vc_policies: [],
      request_credentials: []
    }
  }

  const vpPolicies = new Set<string>()
  const vcPolicies = new Set<string>()

  const requestCredentials = credentials.allow.flatMap((entry: any) => {
    if (entry.vpPolicies)
      entry.vpPolicies.forEach((policy: string) => vpPolicies.add(policy))
    if (entry.vcPolicies)
      entry.vcPolicies.forEach((policy: string) => vcPolicies.add(policy))

    return entry.requestCredentials.map((credentialRequest: any) => ({
      type: credentialRequest.type,
      format: credentialRequest.format,
      policies: credentialRequest.policies
        ?.map((policy: any) => {
          if (typeof policy === 'string') {
            return policy
          }
          if (typeof policy === 'object' && policy.policy) {
            return {
              policy: policy.policy,
              args: policy.args
            }
          }
          return undefined
        })
        .filter(Boolean)
    }))
  })

  return {
    vp_policies: Array.from(vpPolicies),
    vc_policies: Array.from(vcPolicies),
    request_credentials: requestCredentials
  }
}