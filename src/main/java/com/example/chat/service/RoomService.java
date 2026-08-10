package com.example.chat.service;

import com.example.chat.dto.CreateRoomRequest;
import com.example.chat.entity.Room;
import com.example.chat.entity.RoomStatus;
import com.example.chat.repository.RoomRepository;
import com.example.chat.exception.RoomNotFoundException;
import com.example.chat.exception.RoomExpiredException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.security.SecureRandom;
@Service
public class RoomService {

    private final RoomRepository roomRepository;

    private static final String CHARACTERS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    private final SecureRandom random = new SecureRandom();
    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public Room createRoom(CreateRoomRequest request) {

        LocalDateTime createdAt = LocalDateTime.now();

        Room room = new Room();

        room.setName(request.getName());
        room.setJoinCode(generateUniqueJoinCode());
        room.setCreatedAt(createdAt);
        room.setExpiresAt(createdAt.plusHours(24));
        room.setStatus(RoomStatus.ACTIVE);

        return roomRepository.save(room);
    }

    private String generateUniqueJoinCode() {

        String code;

        do {
            StringBuilder builder = new StringBuilder();

            for (int i = 0; i < 6; i++) {
                int index = random.nextInt(CHARACTERS.length());
                builder.append(CHARACTERS.charAt(index));
            }

            code = builder.toString();

        } while (roomRepository.existsByJoinCode(code));

        return code;
    }

    public Room getActiveRoom(String joinCode) {

        Room room = roomRepository.findByJoinCode(joinCode)
                .orElseThrow(() ->
                        new RoomNotFoundException("Room not found"));

        LocalDateTime now = LocalDateTime.now();

        if (now.isAfter(room.getExpiresAt())) {

            room.setStatus(RoomStatus.EXPIRED);
            roomRepository.save(room);

            throw new RoomExpiredException("This room has expired");
        }

        if (room.getStatus() != RoomStatus.ACTIVE) {
            throw new RoomExpiredException("This room is no longer active");
        }

        return room;
    }
}