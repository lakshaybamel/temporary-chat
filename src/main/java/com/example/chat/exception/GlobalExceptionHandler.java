package com.example.chat.exception;

import com.example.chat.dto.ApiErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RoomNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleRoomNotFound(
            RoomNotFoundException exception) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ApiErrorResponse(exception.getMessage()));
    }

    @ExceptionHandler(RoomExpiredException.class)
    public ResponseEntity<ApiErrorResponse> handleRoomExpired(
            RoomExpiredException exception) {

        return ResponseEntity
                .status(HttpStatus.GONE)
                .body(new ApiErrorResponse(exception.getMessage()));
    }
}