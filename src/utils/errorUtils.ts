/**
 * Utility functions for error handling
 */

/**
 * Safely extracts error message from unknown error type
 * @param error - The error object (can be any type)
 * @returns Error message string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Safely extracts error details for API responses
 * @param error - The error object (can be any type)
 * @returns Error details object
 */
export function getErrorDetails(error: unknown): any {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }
  return String(error);
}
