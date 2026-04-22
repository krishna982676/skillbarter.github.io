package com.skillbarter.backend.model;

import java.util.List;

public class ChatContact {
    private String id;
    private String fullName;
    private String email;
    private String location;
    private List<String> skillsOffered;
    private List<String> skillsWanted;
    private String lastMessage;
    private String lastActivity;
    private boolean online;

    public ChatContact() {
    }

    public ChatContact(String id, String fullName, String email, String location, List<String> skillsOffered, List<String> skillsWanted, String lastMessage, String lastActivity, boolean online) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.location = location;
        this.skillsOffered = skillsOffered;
        this.skillsWanted = skillsWanted;
        this.lastMessage = lastMessage;
        this.lastActivity = lastActivity;
        this.online = online;
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

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public String getLastActivity() {
        return lastActivity;
    }

    public void setLastActivity(String lastActivity) {
        this.lastActivity = lastActivity;
    }

    public boolean isOnline() {
        return online;
    }

    public void setOnline(boolean online) {
        this.online = online;
    }
}
