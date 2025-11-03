package com.airplane.quanlyvemaybay.respone;

import com.airplane.quanlyvemaybay.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceBookingResDTO {
    private String id;
    private LocalDateTime createdAt;
    private Long customerId;
    private User customer;
    private FlightInfoRes flight;
    private List<PassengerInfoRes> passengers;
    private SummaryRes summary;
    private List<PaymentResDTO> payment;
}
