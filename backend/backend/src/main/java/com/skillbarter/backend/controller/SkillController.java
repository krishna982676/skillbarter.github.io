package com.skillbarter.backend.controller;

import com.skillbarter.backend.model.CreateSkillRequest;
import com.skillbarter.backend.model.Skill;
import com.skillbarter.backend.service.SkillService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@CrossOrigin(origins = "http://localhost:5173")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @GetMapping
    public List<Skill> getSkills() {
        return skillService.getAllSkills();
    }

    @PostMapping
    public ResponseEntity<Skill> createSkill(@Valid @RequestBody CreateSkillRequest request) {
        Skill created = skillService.addSkill(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
