package com.unified.payload.request;

import java.util.List;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    // Fields that can be updated by the user
    // User cannot change username, email, or password directly through this request
    private String name;
    private String title;
    private String course;
    private String specialization;
    private String graduationYear;
    private String frontendTechnologies;
    private String backendTechnologies;
    private String databaseTechnologies;
    private String devopsTools;
    private List<String> programmingLanguages;
    private List<String> skills;
    // Add any other fields from User model that should be updatable

    // Getters
    public String getName() {
        return name;
    }

    public String getTitle() {
        return title;
    }

    public String getCourse() {
        return course;
    }

    public String getSpecialization() {
        return specialization;
    }

    public String getGraduationYear() {
        return graduationYear;
    }

    public String getFrontendTechnologies() {
        return frontendTechnologies;
    }

    public String getBackendTechnologies() {
        return backendTechnologies;
    }

    public String getDatabaseTechnologies() {
        return databaseTechnologies;
    }

    public String getDevopsTools() {
        return devopsTools;
    }

    public List<String> getProgrammingLanguages() {
        return programmingLanguages;
    }

    public List<String> getSkills() {
        return skills;
    }

    // Setters
    public void setName(String name) {
        this.name = name;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public void setGraduationYear(String graduationYear) {
        this.graduationYear = graduationYear;
    }

    public void setFrontendTechnologies(String frontendTechnologies) {
        this.frontendTechnologies = frontendTechnologies;
    }

    public void setBackendTechnologies(String backendTechnologies) {
        this.backendTechnologies = backendTechnologies;
    }

    public void setDatabaseTechnologies(String databaseTechnologies) {
        this.databaseTechnologies = databaseTechnologies;
    }

    public void setDevopsTools(String devopsTools) {
        this.devopsTools = devopsTools;
    }

    public void setProgrammingLanguages(List<String> programmingLanguages) {
        this.programmingLanguages = programmingLanguages;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }
}
