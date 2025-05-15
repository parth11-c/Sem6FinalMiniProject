package com.unified.service;

import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.unified.model.User;
import com.unified.payload.request.ProfileUpdateRequest;
import com.unified.payload.request.SignupRequest;
import com.unified.repository.UserRepository;
 

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public void registerNewUserAccount(SignupRequest signUpRequest) {
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        
        // Set default role
        Set<String> roles = new HashSet<>();
        roles.add("ROLE_USER");
        user.setRoles(roles);
        
        userRepository.save(user);
    }

    @Override
    public User findUserById(String id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("User not found with id: " + id));
    }

    @Override
    public User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new NoSuchElementException("User not found with username: " + username));
    }

    @Override
    public User updateUserProfile(String userId, ProfileUpdateRequest profileUpdateRequest) {
        User user = findUserById(userId);

        // Update only the fields that are present in the request
        if (profileUpdateRequest.getName() != null) {
            user.setName(profileUpdateRequest.getName());
        }
        if (profileUpdateRequest.getTitle() != null) {
            user.setTitle(profileUpdateRequest.getTitle());
        }
        if (profileUpdateRequest.getCourse() != null) {
            user.setCourse(profileUpdateRequest.getCourse());
        }
        if (profileUpdateRequest.getSpecialization() != null) {
            user.setSpecialization(profileUpdateRequest.getSpecialization());
        }
        if (profileUpdateRequest.getGraduationYear() != null) {
            user.setGraduationYear(profileUpdateRequest.getGraduationYear());
        }
        if (profileUpdateRequest.getFrontendTechnologies() != null) {
            user.setFrontendTechnologies(profileUpdateRequest.getFrontendTechnologies());
        }
        if (profileUpdateRequest.getBackendTechnologies() != null) {
            user.setBackendTechnologies(profileUpdateRequest.getBackendTechnologies());
        }
        if (profileUpdateRequest.getDatabaseTechnologies() != null) {
            user.setDatabaseTechnologies(profileUpdateRequest.getDatabaseTechnologies());
        }
        if (profileUpdateRequest.getDevopsTools() != null) {
            user.setDevopsTools(profileUpdateRequest.getDevopsTools());
        }
        if (profileUpdateRequest.getProgrammingLanguages() != null) {
            user.setProgrammingLanguages(profileUpdateRequest.getProgrammingLanguages());
        }
        if (profileUpdateRequest.getSkills() != null) {
            user.setSkills(profileUpdateRequest.getSkills());
        }
        // Password and email/username changes should be handled separately if needed

        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    @Override
    public User createUser(User user) {
        if (user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    @Override
    public User updateUser(String id, User user) {
        User existingUser = findUserById(id);
        
        // Update fields
        existingUser.setUsername(user.getUsername());
        existingUser.setEmail(user.getEmail());
        if (user.getPassword() != null) {
            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        existingUser.setName(user.getName());
        existingUser.setTitle(user.getTitle());
        existingUser.setCourse(user.getCourse());
        existingUser.setSpecialization(user.getSpecialization());
        existingUser.setGraduationYear(user.getGraduationYear());
        existingUser.setFrontendTechnologies(user.getFrontendTechnologies());
        existingUser.setBackendTechnologies(user.getBackendTechnologies());
        existingUser.setDatabaseTechnologies(user.getDatabaseTechnologies());
        existingUser.setDevopsTools(user.getDevopsTools());
        existingUser.setProgrammingLanguages(user.getProgrammingLanguages());
        existingUser.setSkills(user.getSkills());
        
        return userRepository.save(existingUser);
    }

    @Override
    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new NoSuchElementException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
}
