package com.unified.controller;

import com.unified.service.PlagiarismService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/plagiarism")
@CrossOrigin(origins = "*")
public class PlagiarismController {

    @Autowired
    private PlagiarismService plagiarismService;

    @PostMapping("/check")
    public ResponseEntity<Map<String, Object>> checkPlagiarism(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = plagiarismService.checkPlagiarism(file);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 