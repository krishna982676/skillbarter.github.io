package com.skillbarter.backend.service;

import com.skillbarter.backend.model.CreateSkillRequest;
import com.skillbarter.backend.model.Skill;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class SkillService {

    private final AtomicLong idCounter = new AtomicLong(3);
    private final List<Skill> skills = new ArrayList<>(List.of(
            new Skill(1L, "Java Basics", "Programming", "Arjun"),
            new Skill(2L, "Public Speaking", "Communication", "Meena"),
            new Skill(3L, "UI Design", "Design", "Rohan")
    ));

    public List<Skill> getAllSkills() {
        return skills;
    }

    public Skill addSkill(CreateSkillRequest request) {
        Skill skill = new Skill(
                idCounter.incrementAndGet(),
                request.getTitle().trim(),
                request.getCategory().trim(),
                request.getTrainer().trim()
        );
        skills.add(skill);
        return skill;
    }
}
