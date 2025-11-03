package com.airplane.quanlyvemaybay.respone;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SummaryRes {
    private int adultCount;
    private int childCount;
    private int infantCount;
    private double baseAmount;
    private double seatTotal;
    private double totalAmount;
    private String currency;
    private double discount;
}
