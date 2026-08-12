package com.example.chat.repository;

import com.example.chat.entity.Message;
import com.example.chat.entity.MessageType;
import com.example.chat.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    Optional<Message> findByIdAndRoom_IdAndMessageType(Long id, Long roomId, MessageType messageType);

    List<Message> findByRoomOrderByCreatedAtAsc(Room room);
}