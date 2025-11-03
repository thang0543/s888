package com.airplane.quanlyvemaybay.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "FLIGHT")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Flight {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "flight_seq")
    @SequenceGenerator(name = "flight_seq", sequenceName = "FLIGHT_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "DURATION", length = 50)
    private String duration;

    private String code;

    @Column(name = "CARRIER_CODE", length = 10)
    private String carrierCode;

    @Column(name = "AIRCRAFT_CODE", length = 20)
    private String aircraftCode;

    @Column(name = "DEPARTURE_TIME")
    private LocalDateTime departureTime;

    @Column(name = "ARRIVAL_TIME")
    private LocalDateTime arrivalTime;

    private Double price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ROUTE_ID", nullable = false)
    private Route route;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STAFF_ID", nullable = false)
    private User staff;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "AIRLINE_ID", nullable = false)
    private Airline airline;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

