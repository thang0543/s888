package com.airplane.quanlyvemaybay.controller;

import com.airplane.quanlyvemaybay.entity.Airline;
import com.airplane.quanlyvemaybay.respone.AirlineResDTO;
import com.airplane.quanlyvemaybay.service.AirlineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/airlines")
@CrossOrigin(origins = "*")
public class AirlineController {

    private final AirlineService airlineService;

    public AirlineController(AirlineService airlineService) {
        this.airlineService = airlineService;
    }

    @GetMapping
    public List<AirlineResDTO> getAllAirlines() {
        return airlineService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Airline> getAirlineById(@PathVariable String id) {
        return airlineService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Airline createAirline(@RequestBody Airline airline) {
        return airlineService.save(airline);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAirline(@PathVariable Long id) {
        airlineService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
