package com.unified.model;

import java.util.List;
import java.util.Set;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    @NotBlank
    @Size(max = 20)
    private String username;

    @Indexed(unique = true)
    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @NotBlank
    @Size(max = 120)
    private String password;

    @NotBlank
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
    private String role;
    private Set<String> roles;

    public User() {
    }

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(String graduationYear) {
        this.graduationYear = graduationYear;
    }

    public String getFrontendTechnologies() {
        return frontendTechnologies;
    }

    public void setFrontendTechnologies(String frontendTechnologies) {
        this.frontendTechnologies = frontendTechnologies;
    }

    public String getBackendTechnologies() {
        return backendTechnologies;
    }

    public void setBackendTechnologies(String backendTechnologies) {
        this.backendTechnologies = backendTechnologies;
    }

    public String getDatabaseTechnologies() {
        return databaseTechnologies;
    }

    public void setDatabaseTechnologies(String databaseTechnologies) {
        this.databaseTechnologies = databaseTechnologies;
    }

    public String getDevopsTools() {
        return devopsTools;
    }

    public void setDevopsTools(String devopsTools) {
        this.devopsTools = devopsTools;
    }

    public List<String> getProgrammingLanguages() {
        return programmingLanguages;
    }

    public void setProgrammingLanguages(List<String> programmingLanguages) {
        this.programmingLanguages = programmingLanguages;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
}
