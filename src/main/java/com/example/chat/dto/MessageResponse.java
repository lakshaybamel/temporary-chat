package com.example.chat.dto;

import com.example.chat.entity.Message;
import com.example.chat.entity.MessageType;

import java.time.LocalDateTime;

public class MessageResponse {

    private Long id;
    private String senderName;
    private MessageType messageType;
    private String content;

    private String fileName;
    private String filePath;
    private Long fileSize;
    private String mimeType;

    private LocalDateTime createdAt;

    public MessageResponse(Message message) {
        this.id = message.getId();
        this.senderName = message.getSenderName();
        this.messageType = message.getMessageType();
        this.content = message.getContent();

        this.fileName = message.getFileName();
        this.filePath = message.getFilePath();
        this.fileSize = message.getFileSize();
        this.mimeType = message.getMimeType();

        this.createdAt = message.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getSenderName() {
        return senderName;
    }

    public MessageType getMessageType() {
        return messageType;
    }

    public String getContent() {
        return content;
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
}