package com.skillbarter.backend.service;

import com.skillbarter.backend.model.Profile;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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
}
