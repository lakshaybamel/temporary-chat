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
import com.example.chat.service.MessageService;
import com.example.chat.service.FileStorageService;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestParam;
import com.example.chat.entity.Message;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;


import java.util.Map;


import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;
    private final QrCodeService qrCodeService;
    private final MessageService messageService;
    private final FileStorageService fileStorageService;
    private final SimpMessagingTemplate messagingTemplate;

    public RoomController(
            RoomService roomService,
            QrCodeService qrCodeService,
            MessageService messageService,
            FileStorageService fileStorageService,
            SimpMessagingTemplate messagingTemplate) {

        this.roomService = roomService;
        this.qrCodeService = qrCodeService;
        this.messageService = messageService;
        this.fileStorageService = fileStorageService;
        this.messagingTemplate = messagingTemplate;
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

    @PostMapping("/{joinCode}/files")
    public ResponseEntity<?> uploadFile(
            @PathVariable String joinCode,
            @RequestParam("file") MultipartFile file,
            @RequestParam("senderName") String senderName) {

        try {

            if (senderName == null ||
                    senderName.isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Sender name is required."
                                )
                        );
            }

            Room room =
                    roomService.getActiveRoom(joinCode);


            String storagePath =
                    fileStorageService.uploadFile(
                            room.getJoinCode(),
                            file
                    );


            String mimeType =
                    file.getContentType() != null
                            ? file.getContentType()
                            : "application/octet-stream";


            Message message =
                    messageService.createFileMessage(
                            room,
                            senderName,
                            file.getOriginalFilename(),
                            storagePath,
                            file.getSize(),
                            mimeType
                    );

            MessageResponse messageResponse =
                    new MessageResponse(message);

            messagingTemplate.convertAndSend(
                    "/topic/room/" + room.getJoinCode(),
                    messageResponse
            );

            return ResponseEntity.ok(messageResponse);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );

        } catch (IOException e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "message",
                                    "Unable to upload file."
                            )
                    );
        }
    }
}