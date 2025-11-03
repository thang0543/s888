package com.airplane.quanlyvemaybay.repository;

import com.airplane.quanlyvemaybay.entity.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PassengerRepository extends JpaRepository<Passenger, Long> {
    Passenger findByPassportNumber(String passportNumber);
}
