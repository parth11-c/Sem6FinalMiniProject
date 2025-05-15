package com.unified.payload.request;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProjectRequest {
    @NotBlank
    @Size(min = 3, max = 100)
    private String name;

    @NotBlank
    @Size(min = 10, max = 1000)
    private String description;

    private String status; // e.g., "active", "completed", "on-hold"

    private List<String> tags;
    private List<String> technologies;
    private List<String> techStack;
    private List<String> languages;
    private List<String> groupMembers;

    @NotBlank
    private String duration; // e.g., "3 months", "Ongoing"

    @NotBlank
    private String type; // e.g., "Personal", "Academic", "Client"

    @NotBlank
    private String category; // e.g., "Web Development", "Mobile App", "Data Science"

    private String documentUrl;
    private String documentName;
}
