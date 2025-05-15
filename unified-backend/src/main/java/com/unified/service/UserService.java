package com.unified.service;

import com.unified.model.User;
import com.unified.payload.request.ProfileUpdateRequest;
import com.unified.payload.request.SignupRequest;
import java.util.List;
import java.util.Optional;

public interface UserService {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    void registerNewUserAccount(SignupRequest signUpRequest);
    User findUserById(String id);
    User findUserByUsername(String username);
    User updateUserProfile(String userId, ProfileUpdateRequest profileUpdateRequest);
    
    // New methods
    List<User> getAllUsers();
    Optional<User> getUserById(String id);
    User createUser(User user);
    User updateUser(String id, User user);
    void deleteUser(String id);
}
