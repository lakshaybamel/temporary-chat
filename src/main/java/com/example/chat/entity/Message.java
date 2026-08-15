package com.example.chat.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

import java.time.ZoneId;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false)
    private MessageType messageType;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "sender_name", nullable = false, length = 100)
    private String senderName;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Message() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));
    }

    public Long getId() {
        return id;
    }

    public Room getRoom() {
        return room;
    }

    public MessageType getMessageType() {
        return messageType;
    }

    public String getContent() {
        return content;
    }

    public String getSenderName() {
        return senderName;
    }

    public String getFileName() {
        return fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public String getMimeType() {
        return mimeType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public void setMessageType(MessageType messageType) {
        this.messageType = messageType;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }
}