package com.skillbarter.backend.model;

import jakarta.validation.constraints.NotBlank;

public class CreateSkillRequest {
    @NotBlank(message = "title is required")
    private String title;

    @NotBlank(message = "category is required")
    private String category;

    @NotBlank(message = "trainer is required")
    private String trainer;

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
