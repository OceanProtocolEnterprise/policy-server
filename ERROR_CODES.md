📁 HTTP 4xx Client Errors

| Code | Error Name             | Description                                                                                   | When It's Used                                                                 |
|------|------------------------|-----------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| 400  | `MISSING_FIELDS`       | One or more required fields are missing in the request payload.                              | `consumerAddress`, `ddo`, `serviceId`, or `sessionId` is not provided.         |
| 400  | `SESSION_REQUIRED`     | A required session ID is missing in the request.                                              | Used when `sessionId` is a necessary parameter for continuation.               |
| 403  | `ADDRESS_DENIED`       | Consumer's address was explicitly placed in a deny list.                                      | The address is present in the deny list at either asset or service level.      |
| 403  | `ADDRESS_NOT_ALLOWED`  | Consumer's address is not included in allow lists, and no wildcard is defined.               | Address doesn’t match policy-defined allow rules.                              |
| 403  | `EMPTY_ALLOW_LIST`     | A policy has an allow list defined but it is empty.                                           | Indicates policy misconfiguration at asset/service level.                      |
| 404  | `SERVICE_NOT_FOUND`    | The requested service ID does not match any service in the DDO.                              | Service ID provided does not exist in the credentialSubject.                   |
| 422  | `INVALID_JSON`         | Failed to parse a JSON string (e.g., `policyServer`) or the structure is not as expected.    | JSON parsing fails or fields don’t meet the schema.                            |
| 422  | `CREDENTIAL_FETCH_FAILED` | SSIpolicy exists but `request_credentials` could not be fetched or is invalid.             | A malformed or missing SSI structure inside `ddo.credentials`.                 |

⚠️ Default Fallback

| Code | Error Name          | Description                                |
|------|---------------------|--------------------------------------------|
| 500  | `UNKNOWN_ERROR`     | An unexpected internal error occurred.     |