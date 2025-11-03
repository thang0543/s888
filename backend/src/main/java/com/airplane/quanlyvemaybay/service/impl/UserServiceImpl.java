package com.airplane.quanlyvemaybay.service.impl;

import com.airplane.quanlyvemaybay.entity.User;
import com.airplane.quanlyvemaybay.repository.UserRepository;
import com.airplane.quanlyvemaybay.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public User save(Map<String, Object> newCustomerData) {
        String email = (String) newCustomerData.get("email");
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email đã tồn tại: " + email);
        }

        LocalDateTime dob = null;
        if (newCustomerData.get("dob") != null) {
            dob = LocalDate.parse((String) newCustomerData.get("dob"), DateTimeFormatter.ofPattern("yyyy-MM-dd"))
                    .atStartOfDay();
        }

        String defaultPassword = "12345678";

        User user = User.builder()
                .fullName((String) newCustomerData.get("full_name"))
                .email(email)
                .phoneNumber((String) newCustomerData.get("phone"))
                .dob(dob)
                .role("CUSTOMER")
                .password(defaultPassword)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return userRepository.save(user);
    }

    @Override
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return Optional.ofNullable(userRepository.findByEmail(email));
    }
}
