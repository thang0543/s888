package com.airplane.quanlyvemaybay.request;

import lombok.Data;

@Data
public class SummaryDTO {
    private int adultCount;
    private int childCount;
    private int infantCount;
    private Double baseAmount;
    private Double seatTotal;
    private Double totalAmount;
    private String currency;
    private Double discountAmount;
}