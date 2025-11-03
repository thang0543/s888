package com.airplane.quanlyvemaybay.respone;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FlightInfoRes {
    private Long id;
    private String code;
    private String airline;
    private String from;
    private String to;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private Double basePrice;
    private String duration;
    private String carrierCode;
    private String aircraftCode;
}
