package com.airplane.quanlyvemaybay.service.impl;

import com.airplane.quanlyvemaybay.entity.Airline;
import com.airplane.quanlyvemaybay.repository.AirlineRepository;
import com.airplane.quanlyvemaybay.respone.AirlineResDTO;
import com.airplane.quanlyvemaybay.service.AirlineService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AirlineServiceImpl implements AirlineService {

    private final AirlineRepository airlineRepository;

    public AirlineServiceImpl(AirlineRepository airlineRepository) {
        this.airlineRepository = airlineRepository;
    }

    @Override
    public List<AirlineResDTO> findAll() {
        return airlineRepository.findAllIdAndName();
    }

    @Override
    public Optional<Airline> findById(String id) {
        return airlineRepository.findByCode(id);
    }

    @Override
    public Airline save(Airline airline) {
        return airlineRepository.save(airline);
    }

    @Override
    public void deleteById(Long id) {
        airlineRepository.deleteById(id);
    }
}
