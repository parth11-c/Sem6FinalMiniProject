package com.unified.model;

import java.util.Date;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    @Id
    private String id;
    private String name;
    private String description;
    private Date createdAt;
    private String status; // "active" or "completed"
    private List<String> tags;
    private List<String> technologies;
    private List<String> techStack;
    private List<String> languages;
    private List<String> groupMembers;
    private String duration;
    private String type;
    private String category;
    private String ownerId; // To link to the user who created the project
    private String documentUrl; // URL or path to the uploaded document
    private String documentName; // Original name of the uploaded document
}
