package com.airplane.quanlyvemaybay.entity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "PASSENGERS")
@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class Passenger {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "passenger_id_seq")
    @SequenceGenerator(name = "passenger_id_seq", sequenceName = "PASSENGERS_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "FULL_NAME", nullable = false)
    private String fullName;

    @Column(name = "EMAIL", nullable = false)
    private String email;

    @Column(name = "PASSPORT_NUMBER", nullable = false)
    private String passportNumber;

    @Column(name = "PHONE_NUMBER", nullable = false)
    private String phoneNumber;

    @Column(name = "NATIONALITY", nullable = false)
    private String nationality;

    @Column(name = "DOB")
    private LocalDateTime dob;

    private String seat;

    private String seatPrice;

    private String type;

    @Column(name = "REGISTRATION_DATE")
    private LocalDateTime registrationDate;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

}
