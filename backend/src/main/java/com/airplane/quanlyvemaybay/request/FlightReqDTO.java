package com.airplane.quanlyvemaybay.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FlightReqDTO {

    private Long id;

    private String code;

    private Double price;

    private Long airline;

    private Long staff;

    private Long route;

}
