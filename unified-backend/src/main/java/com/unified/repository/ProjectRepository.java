package com.unified.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.unified.model.Project;

 

public interface ProjectRepository extends MongoRepository<Project, String> {
    List<Project> findByOwnerId(String ownerId);
    List<Project> findByCategory(String category);
    List<Project> findByStatus(String status);
    List<Project> findByLanguagesContaining(String language);
    List<Project> findByTechnologiesContaining(String technology);
}
