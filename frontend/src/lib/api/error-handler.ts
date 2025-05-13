import { NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";

/**
 * Standard error response handler for API routes
 *
 * @param error - The error that occurred
 * @param context - Additional context about where the error occurred
 * @param status - HTTP status code to return (defaults to 500)
 * @returns A NextResponse with appropriate error details
 */
export function handleApiError(error: unknown, context: string, status = 500) {
  const errorMessage =
    error instanceof Error ? error.message : "Unknown error occurred";
  const errorStack = error instanceof Error ? error.stack : undefined;

  logger.error(`Error in ${context}:`, {
    message: errorMessage,
    stack: errorStack,
  });

  return NextResponse.json({ error: errorMessage }, { status });
}

/**
 * Standard unauthorized response for API routes
 *
 * @param message - Optional custom message
 * @returns A NextResponse with 401 status
 */
export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Standard forbidden response for API routes
 *
 * @param message - Optional custom message
 * @returns A NextResponse with 403 status
 */
export function forbiddenResponse(
  message = "Forbidden: Insufficient permissions",
) {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Standard bad request response for API routes
 *
 * @param message - Optional custom message
 * @returns A NextResponse with 400 status
 */
export function badRequestResponse(message = "Bad request") {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Standard not found response for API routes
 *
 * @param message - Optional custom message
 * @returns A NextResponse with 404 status
 */
export function notFoundResponse(message = "Resource not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}
