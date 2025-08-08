import "zod-openapi/extend";
import { z } from "zod";

/**
 * Standard error response schema used for OpenAPI documentation
 */
export const ErrorResponse = z
    .object({
        type: z
            .enum([
                "validation",
                "authentication",
                "forbidden",
                "not_found",
                "rate_limit",
                "internal",
            ])
            .openapi({
                description: "The error type category",
                examples: ["validation", "authentication"],
            }),
        code: z.string().openapi({
            description: "Machine-readable error code identifier",
            examples: ["invalid_parameter", "missing_required_field", "unauthorized"],
        }),
        message: z.string().openapi({
            description: "Human-readable error message",
            examples: ["The request was invalid", "Authentication required"],
        }),
        param: z
            .string()
            .optional()
            .openapi({
                description: "The parameter that caused the error (if applicable)",
                examples: ["email", "user_id"],
            }),
        details: z.any().optional().openapi({
            description: "Additional error context information",
        }),
    })
    .openapi({ ref: "ErrorResponse" });

export type ErrorResponseType = z.infer<typeof ErrorResponse>;

/**
 * Standardized error codes for the API
 */
export const ErrorCodes = {
    // Validation errors (400)
    Validation: {
        INVALID_PARAMETER: "invalid_parameter",
        MISSING_REQUIRED_FIELD: "missing_required_field",
        INVALID_FORMAT: "invalid_format",
        ALREADY_EXISTS: "already_exists",
        IN_USE: "resource_in_use",
        INVALID_STATE: "invalid_state",
    },

    // Authentication errors (401)
    Authentication: {
        UNAUTHORIZED: "unauthorized",
        INVALID_TOKEN: "invalid_token",
        EXPIRED_TOKEN: "expired_token",
        INVALID_CREDENTIALS: "invalid_credentials",
    },

    // Permission errors (403)
    Permission: {
        FORBIDDEN: "forbidden",
        INSUFFICIENT_PERMISSIONS: "insufficient_permissions",
        ACCOUNT_RESTRICTED: "account_restricted",
    },

    // Resource not found errors (404)
    NotFound: {
        RESOURCE_NOT_FOUND: "resource_not_found",
    },

    // Rate limit errors (429)
    RateLimit: {
        TOO_MANY_REQUESTS: "too_many_requests",
        QUOTA_EXCEEDED: "quota_exceeded",
    },

    // Server errors (500)
    Server: {
        INTERNAL_ERROR: "internal_error",
        SERVICE_UNAVAILABLE: "service_unavailable",
        DEPENDENCY_FAILURE: "dependency_failure",
    },
};

