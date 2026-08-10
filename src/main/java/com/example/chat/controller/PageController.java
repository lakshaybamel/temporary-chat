package com.example.chat.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class PageController {

    @GetMapping("/room/{joinCode}")
    public String roomPage(
            @PathVariable String joinCode) {

        return "forward:/room.html";
    }
}