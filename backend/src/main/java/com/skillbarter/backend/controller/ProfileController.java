package com.skillbarter.backend.controller;

import com.skillbarter.backend.model.Profile;
import com.skillbarter.backend.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://krishna982676.github.io"
})
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public List<Profile> getProfiles() {
        return profileService.getAllProfiles();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Profile> getProfileById(@PathVariable String id) {
        return profileService.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Profile> updateProfile(@PathVariable String id, @RequestBody Profile payload) {
        return profileService.updateById(id, payload)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
