package com.example.chat.controller;

import com.example.chat.dto.ChatMessageRequest;
import com.example.chat.dto.MessageResponse;
import com.example.chat.entity.Message;
import com.example.chat.entity.Room;
import com.example.chat.service.MessageService;
import com.example.chat.service.RoomService;
import jakarta.validation.Valid;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;

import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    private final RoomService roomService;
    private final MessageService messageService;

    public ChatWebSocketController(
            RoomService roomService,
            MessageService messageService) {

        this.roomService = roomService;
        this.messageService = messageService;
    }

    @MessageMapping("/chat/{joinCode}")
    @SendTo("/topic/room/{joinCode}")
    public MessageResponse sendMessage(
            @DestinationVariable String joinCode,
            @Valid ChatMessageRequest request) {

        Room room =
                roomService.getActiveRoom(joinCode);

        Message message =
                messageService.createTextMessage(
                        room,
                        request
                );

        return new MessageResponse(message);
    }
}