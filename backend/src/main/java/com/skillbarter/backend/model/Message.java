package com.skillbarter.backend.model;

public class Message {
    private String id;
    private String fromId;
    private String toId;
    private String text;
    private String createdAt;

    public Message() {
    }

    public Message(String id, String fromId, String toId, String text, String createdAt) {
        this.id = id;
        this.fromId = fromId;
        this.toId = toId;
        this.text = text;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFromId() {
        return fromId;
    }

    public void setFromId(String fromId) {
        this.fromId = fromId;
    }

    public String getToId() {
        return toId;
    }

    public void setToId(String toId) {
        this.toId = toId;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
