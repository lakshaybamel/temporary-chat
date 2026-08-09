package com.example.chat.repository;

import com.example.chat.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {

    Optional<Room> findByJoinCode(String joinCode);

    boolean existsByJoinCode(String joinCode);
}