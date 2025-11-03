package com.airplane.quanlyvemaybay.respone;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PassengerInfoRes {
    private Long id;
    private Long idTicket;
    private String fullName;
    private String type;
    private String passportNo;
    private String seat;
    private Double seatPrice;
    private String email;
    private String phone;
    private String dob;
    private String country;
    private String address;
    private Double priceFlight;
}
