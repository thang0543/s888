package com.airplane.quanlyvemaybay.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "AIRLINES")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Airline {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "airline_id_seq")
    @SequenceGenerator(name = "airline_id_seq", sequenceName = "AIRLINES_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "NAME", nullable = false)
    private String name;

    private String code;

    @Column(name = "COUNTRY", nullable = false)
    private String country;

    @Column(name = "MANUFACTURNER", nullable = false)
    private String manufacturer;

    @Column(name = "MODEL", nullable = false)
    private String model;

    @Column(name = "CAPACITY", nullable = false)
    private String capacity;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "ECONOMY_COMMISSION")
    private Double economyCommission;

    @Column(name = "BUSINESS_COMMISSION")
    private Double businessCommission;

    @Column(name = "TICKET_ISSUANCE_FEE")
    private Double ticketIssuanceFee;

    @Column(name = "CHANGE_FEE")
    private Double changeFee;

    @CreationTimestamp
    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
}
