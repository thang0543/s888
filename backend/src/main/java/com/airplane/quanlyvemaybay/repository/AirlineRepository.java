package com.airplane.quanlyvemaybay.repository;

import com.airplane.quanlyvemaybay.entity.Airline;
import com.airplane.quanlyvemaybay.respone.AirlineResDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AirlineRepository extends JpaRepository<Airline, Long> {
    @Query("SELECT new com.airplane.quanlyvemaybay.respone.AirlineResDTO(a.id, a.name) FROM Airline a")
    List<AirlineResDTO> findAllIdAndName();
    Optional<Airline> findByCode(String name);
}
