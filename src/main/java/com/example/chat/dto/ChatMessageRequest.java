package com.example.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChatMessageRequest {

    @NotBlank(message = "Message cannot be empty")
    @Size(
            max = 5000,
            message = "Message cannot exceed 5000 characters"
    )
    private String content;

    @NotBlank(message = "Sender name is required")
    @Size(
            max = 100,
            message = "Sender name cannot exceed 100 characters"
    )
    private String senderName;

    public ChatMessageRequest() {
    }

    public String getContent() {
        return content;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }
}