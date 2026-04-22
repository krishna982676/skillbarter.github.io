package com.skillbarter.backend.controller;

import com.skillbarter.backend.model.ChatContact;
import com.skillbarter.backend.model.Message;
import com.skillbarter.backend.service.MessagingService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://krishna982676.github.io"
})
public class MessageController {

    private final MessagingService messagingService;

    public MessageController(MessagingService messagingService) {
        this.messagingService = messagingService;
    }

    @GetMapping("/thread")
    public List<Message> getThread(@RequestParam String myId, @RequestParam String otherId) {
        return messagingService.getThread(myId, otherId);
    }

    @PostMapping
    public Message addMessage(@RequestBody Message payload) {
        return messagingService.addMessage(payload);
    }

    @GetMapping("/contacts")
    public List<ChatContact> getContacts(@RequestParam String userId) {
        return messagingService.getContacts(userId);
    }
}
