package com.placeit.auth.exception;

import com.placeit.auth.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Handle BadCredentialsException - Returns 401 UNAUTHORIZED
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentials(
            BadCredentialsException ex, WebRequest request) {
        log.warn("Bad credentials attempt");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid email or password"));
    }

    /**
     * Handle AuthenticationException - Returns 401 UNAUTHORIZED
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {
        log.warn("Authentication error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Authentication failed: " + ex.getMessage()));
    }

    /**
     * Handle UserAlreadyExistsException - Returns 409 CONFLICT
     */
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Object>> handleUserAlreadyExists(
            UserAlreadyExistsException ex, WebRequest request) {
        log.warn("User already exists: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Handle AuthException - Returns 401 UNAUTHORIZED or 400 BAD_REQUEST
     */
    @ExceptionHandler(AuthException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthException(
            AuthException ex, WebRequest request) {
        log.warn("Authentication error: {}", ex.getMessage());

        HttpStatus status = ex.getMessage().contains("expired") ||
                ex.getMessage().contains("Invalid") ?
                HttpStatus.UNAUTHORIZED : HttpStatus.BAD_REQUEST;

        return ResponseEntity.status(status)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Handle validation errors - Returns 400 BAD_REQUEST
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationErrors(
            MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("Validation error: {}", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Validation failed: " + errors));
    }

    /**
     * Handle IllegalArgumentException - Returns 400 BAD_REQUEST
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgument(
            IllegalArgumentException ex, WebRequest request) {
        log.warn("Illegal argument: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Handle generic exceptions - Returns 500 INTERNAL_SERVER_ERROR
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGlobalException(
            Exception ex, WebRequest request) {
        log.error("Unexpected error occurred", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred: " + ex.getMessage()));
    }
}
