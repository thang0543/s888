package com.airplane.quanlyvemaybay.respone;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RouteSegmentResDTO {

    private String fromAirport;

    private String toAirport;

    private Integer sequence;

    private Integer flightDuration;

    private String stopType;

    private Integer stopDuration;

}
