package com.skillbarter.backend.service;

import com.skillbarter.backend.model.Profile;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ProfileService {

    private final List<Profile> profiles = new ArrayList<>(List.of(
            new Profile("u2", "Priya Sharma", "priya@ex.com", "Mumbai, IN", List.of("Python", "Machine Learning"), List.of("Yoga", "Watercolor")),
            new Profile("u3", "Diego Lopes", "diego@ex.com", "Delhi, IN", List.of("Spanish", "Portuguese"), List.of("React.js", "Python")),
            new Profile("u4", "Kavita Rao", "kavita@ex.com", "Pune, IN", List.of("Yoga", "Meditation", "Zumba"), List.of("Spanish", "Guitar")),
            new Profile("u5", "Sam Torres", "sam@ex.com", "Bengaluru, IN", List.of("Guitar", "Piano"), List.of("Python", "Data Analysis"))
    ));

    public List<Profile> getAllProfiles() {
        return profiles;
    }

    public Optional<Profile> getById(String id) {
        return profiles.stream().filter(profile -> profile.getId().equals(id)).findFirst();
    }

    public Optional<Profile> updateById(String id, Profile payload) {
        Optional<Profile> existing = getById(id);
        existing.ifPresent(profile -> {
            if (payload.getFullName() != null) profile.setFullName(payload.getFullName());
            if (payload.getEmail() != null) profile.setEmail(payload.getEmail());
            if (payload.getLocation() != null) profile.setLocation(payload.getLocation());
            if (payload.getSkillsOffered() != null) profile.setSkillsOffered(payload.getSkillsOffered());
            if (payload.getSkillsWanted() != null) profile.setSkillsWanted(payload.getSkillsWanted());
        });
        return existing;
    }
}
