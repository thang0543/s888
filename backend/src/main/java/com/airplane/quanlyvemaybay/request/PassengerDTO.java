package com.airplane.quanlyvemaybay.request;

import lombok.Data;

@Data
public class PassengerDTO {
    private String fullName;
    private String type;
    private String passportNo;
    private String seat;
    private String seatPrice;
    private String email;
    private String phone;
    private String dob;
    private String country;
    private String address;
    private String priceFlight;
}