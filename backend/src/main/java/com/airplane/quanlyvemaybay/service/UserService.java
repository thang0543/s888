package com.airplane.quanlyvemaybay.service;

import com.airplane.quanlyvemaybay.entity.User;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface UserService {
    List<User> findAll();
    Optional<User> findById(Long id);
    User save(Map<String, Object> newCustomerData);
    void deleteById(Long id);
    Optional<User> findByEmail(String email);
}
