package com.airplane.quanlyvemaybay.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FlightDTO {
    private Long id;
    private String code;
    private String airline;
    private String from;
    private String to;
    private LocalDateTime departure;
    private LocalDateTime arrival;
    private Double basePrice;
    private String duration;
    private String carrierCode;
    private String aircraftCode;
    private String departureTime;
    private String arrivalTime;
}
