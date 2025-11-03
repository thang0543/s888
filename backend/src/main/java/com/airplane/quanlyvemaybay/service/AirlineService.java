package com.airplane.quanlyvemaybay.service;

import com.airplane.quanlyvemaybay.entity.Airline;
import com.airplane.quanlyvemaybay.respone.AirlineResDTO;

import java.util.List;
import java.util.Optional;

public interface AirlineService {
    List<AirlineResDTO> findAll();
    Optional<Airline> findById(String id);
    Airline save(Airline airline);
    void deleteById(Long id);
}
