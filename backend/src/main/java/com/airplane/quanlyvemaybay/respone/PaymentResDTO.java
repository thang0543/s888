package com.airplane.quanlyvemaybay.respone;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResDTO {

    private Long id;

    private String paymentCode;

    private String method;

    private Double amount;

    private String currency;

    private String status;

    private String transactionId;

    private LocalDateTime paymentDate;
}
