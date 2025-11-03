package com.airplane.quanlyvemaybay.respone;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceSummaryDTO {
    private Long invoiceId;
    private String invoiceNumber;
    private LocalDateTime invoiceDate;
    private String customerName;
    private String flightCode;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private String airlineName;
    private String route;
    private String totalAmountCurrency;
}
