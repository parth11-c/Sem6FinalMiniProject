package com.unified.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.unified.model.User;
import com.unified.payload.request.ProfileUpdateRequest;
import com.unified.payload.response.MessageResponse;
import com.unified.security.UserDetailsImpl;
import com.unified.service.UserService;

import jakarta.validation.Valid;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User user) {
        User updatedUser = userService.updateUser(id, user);
        if (updatedUser != null) {
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUserProfile() {
        String userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(new MessageResponse());
        }
        try {
            User user = userService.findUserById(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(new MessageResponse());
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateUserProfile(@Valid @RequestBody ProfileUpdateRequest profileUpdateRequest) {
        String userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(new MessageResponse());
        }
        try {
            User updatedUser = userService.updateUserProfile(userId, profileUpdateRequest);
            return ResponseEntity.ok(new MessageResponse());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse());
        }
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            return userDetails.getId();
        }
        return null;
    }
}
