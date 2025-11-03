package com.airplane.quanlyvemaybay.service.impl;

import com.airplane.quanlyvemaybay.entity.Passenger;
import com.airplane.quanlyvemaybay.repository.PassengerRepository;
import com.airplane.quanlyvemaybay.service.PassengerService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PassengerServiceImpl implements PassengerService {

    private final PassengerRepository passengerRepository;

    public PassengerServiceImpl(PassengerRepository passengerRepository) {
        this.passengerRepository = passengerRepository;
    }

    @Override
    public List<Passenger> findAll() {
        return passengerRepository.findAll();
    }

    @Override
    public Optional<Passenger> findById(Long id) {
        return passengerRepository.findById(id);
    }

    @Override
    public Passenger save(Passenger passenger) {
        return passengerRepository.save(passenger);
    }

    @Override
    public void deleteById(Long id) {
        passengerRepository.deleteById(id);
    }
}
