package com.airplane.quanlyvemaybay.respone;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FlightResDTO {
    private Long id;
    private String flightNumber;
    private String aircraftType;
    private Long router;
    private String airlineName;
    private String routeName;
    private Long airline;
    private List<RouteSegmentResDTO> segments;
}

