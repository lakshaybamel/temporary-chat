package com.example.chat.service;

import com.example.chat.entity.Message;
import com.example.chat.entity.Room;
import com.example.chat.dto.ChatMessageRequest;
import com.example.chat.entity.MessageType;
import com.example.chat.repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.util.List;

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
}

