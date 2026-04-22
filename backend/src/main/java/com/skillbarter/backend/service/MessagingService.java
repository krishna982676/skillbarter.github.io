package com.skillbarter.backend.service;

import com.skillbarter.backend.model.BarterRequest;
import com.skillbarter.backend.model.ChatContact;
import com.skillbarter.backend.model.Message;
import com.skillbarter.backend.model.Profile;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class MessagingService {

    private final ProfileService profileService;
    private final AtomicLong messageId = new AtomicLong(20);
    private final AtomicLong requestId = new AtomicLong(20);

    private final List<Message> messages = new ArrayList<>(List.of(
            new Message("m1", "u2", "demo@skillbarter.com", "Hi Arjun! Interested in exchanging Python for Yoga?", Instant.now().minusSeconds(7200).toString()),
            new Message("m2", "demo@skillbarter.com", "u2", "Yes, absolutely. Let's do this weekend.", Instant.now().minusSeconds(7000).toString()),
            new Message("m3", "u3", "demo@skillbarter.com", "Hola! Ready for your first Spanish lesson?", Instant.now().minusSeconds(86000).toString())
    ));

    private final List<BarterRequest> requests = new ArrayList<>(List.of(
            new BarterRequest("r1", "u2", "demo@skillbarter.com", "Python Programming", "Yoga & Meditation", "Let's exchange sessions this weekend.", "pending", 2, Instant.now().minusSeconds(6400).toString()),
            new BarterRequest("r2", "u5", "demo@skillbarter.com", "Guitar", "Data Analysis", "Happy to learn data analysis in return.", "accepted", 2, Instant.now().minusSeconds(172000).toString())
    ));

    public MessagingService(ProfileService profileService) {
        this.profileService = profileService;
    }

    public List<Message> getThread(String myId, String otherId) {
        return messages.stream()
                .filter(message -> (message.getFromId().equals(myId) && message.getToId().equals(otherId))
                        || (message.getFromId().equals(otherId) && message.getToId().equals(myId)))
                .sorted(Comparator.comparing(Message::getCreatedAt))
                .collect(Collectors.toList());
    }

    public Message addMessage(Message payload) {
        Message message = new Message(
                "m" + messageId.incrementAndGet(),
                payload.getFromId(),
                payload.getToId(),
                payload.getText(),
                Instant.now().toString()
        );
        messages.add(message);
        return message;
    }

    public List<ChatContact> getContacts(String userId) {
        Map<String, Message> latestByOther = new HashMap<>();
        for (Message message : messages) {
            String otherId = null;
            if (message.getFromId().equals(userId)) otherId = message.getToId();
            if (message.getToId().equals(userId)) otherId = message.getFromId();
            if (otherId == null) continue;

            Message existing = latestByOther.get(otherId);
            if (existing == null || message.getCreatedAt().compareTo(existing.getCreatedAt()) > 0) {
                latestByOther.put(otherId, message);
            }
        }

        List<ChatContact> contacts = new ArrayList<>();
        for (Map.Entry<String, Message> entry : latestByOther.entrySet()) {
            Optional<Profile> profileOpt = profileService.getById(entry.getKey());
            if (profileOpt.isEmpty()) continue;
            Profile profile = profileOpt.get();
            Message message = entry.getValue();

            contacts.add(new ChatContact(
                    profile.getId(),
                    profile.getFullName(),
                    profile.getEmail(),
                    profile.getLocation(),
                    profile.getSkillsOffered(),
                    profile.getSkillsWanted(),
                    message.getText(),
                    message.getCreatedAt(),
                    false
            ));
        }

        contacts.sort((a, b) -> (b.getLastActivity() == null ? "" : b.getLastActivity())
                .compareTo(a.getLastActivity() == null ? "" : a.getLastActivity()));
        return contacts;
    }

    public List<BarterRequest> getRequests(String userId) {
        return requests.stream()
                .filter(request -> request.getFromUserId().equals(userId) || request.getToUserId().equals(userId))
                .peek(request -> {
                    profileService.getById(request.getFromUserId()).ifPresent(request::setFromUser);
                })
                .sorted((a, b) -> (b.getCreatedAt() == null ? "" : b.getCreatedAt())
                        .compareTo(a.getCreatedAt() == null ? "" : a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public BarterRequest createRequest(BarterRequest payload) {
        BarterRequest request = new BarterRequest(
                "r" + requestId.incrementAndGet(),
                payload.getFromUserId(),
                payload.getToUserId(),
                payload.getSkillOffered(),
                payload.getSkillWanted(),
                payload.getMessage(),
                payload.getStatus() == null ? "pending" : payload.getStatus(),
                payload.getCredits() <= 0 ? 2 : payload.getCredits(),
                Instant.now().toString()
        );
        profileService.getById(request.getFromUserId()).ifPresent(request::setFromUser);
        requests.add(request);
        return request;
    }

    public Optional<BarterRequest> updateRequestStatus(String id, String status) {
        Optional<BarterRequest> requestOpt = requests.stream().filter(request -> request.getId().equals(id)).findFirst();
        requestOpt.ifPresent(request -> {
            request.setStatus(status);
            profileService.getById(request.getFromUserId()).ifPresent(request::setFromUser);
        });
        return requestOpt;
    }
}
