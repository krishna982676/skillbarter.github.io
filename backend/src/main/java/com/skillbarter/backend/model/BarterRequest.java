package com.skillbarter.backend.model;

public class BarterRequest {
    private String id;
    private String fromUserId;
    private String toUserId;
    private String skillOffered;
    private String skillWanted;
    private String message;
    private String status;
    private int credits;
    private String createdAt;
    private Profile fromUser;

    public BarterRequest() {
    }

    public BarterRequest(String id, String fromUserId, String toUserId, String skillOffered, String skillWanted, String message, String status, int credits, String createdAt) {
        this.id = id;
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.skillOffered = skillOffered;
        this.skillWanted = skillWanted;
        this.message = message;
        this.status = status;
        this.credits = credits;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFromUserId() {
        return fromUserId;
    }

    public void setFromUserId(String fromUserId) {
        this.fromUserId = fromUserId;
    }

    public String getToUserId() {
        return toUserId;
    }

    public void setToUserId(String toUserId) {
        this.toUserId = toUserId;
    }

    public String getSkillOffered() {
        return skillOffered;
    }

    public void setSkillOffered(String skillOffered) {
        this.skillOffered = skillOffered;
    }

    public String getSkillWanted() {
        return skillWanted;
    }

    public void setSkillWanted(String skillWanted) {
        this.skillWanted = skillWanted;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getCredits() {
        return credits;
    }

    public void setCredits(int credits) {
        this.credits = credits;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public Profile getFromUser() {
        return fromUser;
    }

    public void setFromUser(Profile fromUser) {
        this.fromUser = fromUser;
    }
}
