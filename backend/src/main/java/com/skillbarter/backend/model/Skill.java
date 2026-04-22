package com.skillbarter.backend.model;

public class Skill {
    private Long id;
    private String title;
    private String category;
    private String trainer;

    public Skill() {
    }

    public Skill(Long id, String title, String category, String trainer) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.trainer = trainer;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTrainer() {
        return trainer;
    }

    public void setTrainer(String trainer) {
        this.trainer = trainer;
    }
}
