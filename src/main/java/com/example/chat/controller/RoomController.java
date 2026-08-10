package com.example.chat.controller;

import com.example.chat.dto.CreateRoomRequest;
import com.example.chat.dto.RoomResponse;
import com.example.chat.entity.Room;
import com.example.chat.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.chat.service.QrCodeService;
import com.google.zxing.WriterException;

import java.io.IOException;

import com.example.chat.dto.MessageResponse;
import com.example.chat.entity.Room;
import com.example.chat.service.MessageService;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;
    private final QrCodeService qrCodeService;
    private final MessageService messageService;

    public RoomController(
            RoomService roomService,
            QrCodeService qrCodeService,
            MessageService messageService) {

        this.roomService = roomService;
        this.qrCodeService = qrCodeService;
        this.messageService = messageService;
    }

    @PostMapping
    public ResponseEntity<Room> createRoom(
            @Valid @RequestBody CreateRoomRequest request) {

        Room room = roomService.createRoom(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(room);
    }

    @GetMapping("/{joinCode}")
    public ResponseEntity<RoomResponse> getRoom(
            @PathVariable String joinCode) {

        Room room = roomService.getActiveRoom(joinCode);

        return ResponseEntity.ok(new RoomResponse(room));
    }

    @GetMapping("/{joinCode}/qr")
    public ResponseEntity<byte[]> getRoomQrCode(
            @PathVariable String joinCode) {

        try {

            // Validate that the room exists and is still active
            roomService.getActiveRoom(joinCode);

            byte[] qrCode = qrCodeService.generateRoomQrCode(joinCode);

            return ResponseEntity.ok()
                    .header("Content-Type", "image/png")
                    .body(qrCode);

        } catch (WriterException | IOException exception) {

            return ResponseEntity
                    .internalServerError()
                    .build();
        }
    }

    @GetMapping("/{joinCode}/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable String joinCode) {

        Room room = roomService.getActiveRoom(joinCode);

        List<MessageResponse> messages = messageService
                .getMessages(room)
                .stream()
                .map(MessageResponse::new)
                .toList();

        return ResponseEntity.ok(messages);
    }
}