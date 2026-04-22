package com.skillbarter.backend.controller;

import com.skillbarter.backend.model.BarterRequest;
import com.skillbarter.backend.model.StatusUpdateRequest;
import com.skillbarter.backend.service.MessagingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/barter-requests")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://krishna982676.github.io"
})
public class BarterRequestController {

    private final MessagingService messagingService;

    public BarterRequestController(MessagingService messagingService) {
        this.messagingService = messagingService;
    }

    @GetMapping
    public List<BarterRequest> getRequests(@RequestParam String userId) {
        return messagingService.getRequests(userId);
    }

    @PostMapping
    public BarterRequest createRequest(@RequestBody BarterRequest payload) {
        return messagingService.createRequest(payload);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BarterRequest> updateStatus(@PathVariable String id, @RequestBody StatusUpdateRequest payload) {
        return messagingService.updateRequestStatus(id, payload.getStatus())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
