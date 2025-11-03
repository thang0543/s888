package com.airplane.quanlyvemaybay.service;

import com.airplane.quanlyvemaybay.entity.Passenger;

import java.util.List;
import java.util.Optional;

public interface PassengerService {
    List<Passenger> findAll();
    Optional<Passenger> findById(Long id);
    Passenger save(Passenger passenger);
    void deleteById(Long id);
}
