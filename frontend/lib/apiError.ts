/**
 * Extracts a human-readable error message from an Axios error response.
 * Falls back to a provided string or a generic message.
 */
export function getApiError(error: any, fallback = 'Something went wrong. Please try again.'): string {
  return error?.response?.data?.message || fallback;
}
