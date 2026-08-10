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

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;
    private final QrCodeService qrCodeService;

    public RoomController(
            RoomService roomService,
            QrCodeService qrCodeService) {

        this.roomService = roomService;
        this.qrCodeService = qrCodeService;
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
}