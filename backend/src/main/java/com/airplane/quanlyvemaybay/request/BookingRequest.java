package com.airplane.quanlyvemaybay.request;

import lombok.Data;

import java.util.List;

@Data
public class BookingRequest {
    private FlightDTO flight;
    private List<PassengerDTO> passengers;
    private SummaryDTO summary;
}
