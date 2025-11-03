package com.airplane.quanlyvemaybay.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingPaymentRequestDTO {
    private Long customerId;
    private FlightDTO flight;
    private List<PassengerDTO> passengers;
    private SummaryDTO summary;
    private String paymentMethod;
    private String transactionId;
    private String status;
    private Long promotionId;
}
