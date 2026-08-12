package com.example.chat.service;

import com.example.chat.entity.Message;
import com.example.chat.entity.Room;
import com.example.chat.dto.ChatMessageRequest;
import com.example.chat.entity.MessageType;
import com.example.chat.repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public List<Message> getMessages(Room room) {
        return messageRepository.findByRoomOrderByCreatedAtAsc(room);
    }

    public Message createTextMessage(
            Room room,
            ChatMessageRequest request) {

        Message message = new Message();

        message.setRoom(room);
        message.setMessageType(MessageType.TEXT);
        message.setContent(request.getContent().trim());
        message.setSenderName(request.getSenderName().trim());

        return messageRepository.save(message);
    }

    public Message createFileMessage(
            Room room,
            String senderName,
            String fileName,
            String filePath,
            Long fileSize,
            String mimeType) {

        Message message = new Message();

        message.setRoom(room);
        message.setMessageType(MessageType.FILE);
        message.setSenderName(senderName.trim());

        message.setFileName(fileName);
        message.setFilePath(filePath);
        message.setFileSize(fileSize);
        message.setMimeType(mimeType);

        return messageRepository.save(message);
    }

    public Message getMessageById(Long messageId) {

        return messageRepository
                .findById(messageId)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Message not found."
                        )
                );
    }

    public Optional<Message> getFileMessage(
            Long messageId,
            Long roomId) {

        return messageRepository
                .findByIdAndRoom_IdAndMessageType(
                        messageId,
                        roomId,
                        MessageType.FILE
                );
    }
}

