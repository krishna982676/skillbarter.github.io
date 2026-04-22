package com.skillbarter.backend.model;

import java.util.List;

public class Profile {
    private String id;
    private String fullName;
    private String email;
    private String location;
    private List<String> skillsOffered;
    private List<String> skillsWanted;

    public Profile() {
    }

    public Profile(String id, String fullName, String email, String location, List<String> skillsOffered, List<String> skillsWanted) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.location = location;
        this.skillsOffered = skillsOffered;
        this.skillsWanted = skillsWanted;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<String> getSkillsOffered() {
        return skillsOffered;
    }

    public void setSkillsOffered(List<String> skillsOffered) {
        this.skillsOffered = skillsOffered;
    }

    public List<String> getSkillsWanted() {
        return skillsWanted;
    }

    public void setSkillsWanted(List<String> skillsWanted) {
        this.skillsWanted = skillsWanted;
    }
}
