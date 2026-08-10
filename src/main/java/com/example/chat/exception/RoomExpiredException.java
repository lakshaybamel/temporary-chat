package com.example.chat.exception;

public class RoomExpiredException extends RuntimeException {

    public RoomExpiredException(String message) {
        super(message);
    }
}