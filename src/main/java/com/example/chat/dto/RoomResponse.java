package com.example.chat.dto;

import com.example.chat.entity.Room;

import java.time.LocalDateTime;

public class RoomResponse {

    private Long id;
    private String name;
    private String joinCode;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private String status;

    public RoomResponse() {
    }

    public RoomResponse(Room room) {
        this.id = room.getId();
        this.name = room.getName();
        this.joinCode = room.getJoinCode();
        this.createdAt = room.getCreatedAt();
        this.expiresAt = room.getExpiresAt();
        this.status = room.getStatus().name();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getJoinCode() {
        return joinCode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public String getStatus() {
        return status;
    }
}