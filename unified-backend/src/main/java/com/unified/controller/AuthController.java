package com.unified.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.unified.payload.request.LoginRequest;
import com.unified.payload.request.SignupRequest;
import com.unified.payload.response.JwtResponse;
import com.unified.payload.response.MessageResponse;
import com.unified.security.JwtUtils;
import com.unified.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
    "http://192.168.1.4:8081",
    "http://localhost:8081",
    "http://192.168.1.4:19006",
    "http://localhost:19006",
    "http://192.168.1.4:19000",
    "http://localhost:19000",
    "exp://192.168.1.4:19000"
}, allowCredentials = "true")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    UserService userService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            logger.info("Attempting authentication for user: {}", loginRequest.getUsername());
            
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            logger.info("User {} successfully authenticated", userDetails.getUsername());
            
            return ResponseEntity.ok(new JwtResponse(jwt, userDetails.getUsername(), userDetails.getAuthorities()));
        } catch (AuthenticationException e) {
            logger.error("Authentication failed for user {}: {}", loginRequest.getUsername(), e.getMessage());
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Invalid username or password"));
        } catch (Exception e) {
            logger.error("Unexpected error during authentication: {}", e.getMessage());
            return ResponseEntity
                    .internalServerError()
                    .body(new MessageResponse("Error: An unexpected error occurred"));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        try {
            logger.info("Attempting to register new user: {}", signUpRequest.getUsername());

            if (userService.existsByUsername(signUpRequest.getUsername())) {
                logger.warn("Registration failed - username already exists: {}", signUpRequest.getUsername());
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: Username is already taken!"));
            }

            if (userService.existsByEmail(signUpRequest.getEmail())) {
                logger.warn("Registration failed - email already exists: {}", signUpRequest.getEmail());
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: Email is already in use!"));
            }

            userService.registerNewUserAccount(signUpRequest);
            logger.info("User registered successfully: {}", signUpRequest.getUsername());

            return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        } catch (Exception e) {
            logger.error("Error during user registration: {}", e.getMessage());
            return ResponseEntity
                    .internalServerError()
                    .body(new MessageResponse("Error: An unexpected error occurred during registration"));
        }
    }
}