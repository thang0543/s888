package com.airplane.quanlyvemaybay.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "promotion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "promotion_seq_gen")
    @SequenceGenerator(name = "promotion_seq_gen", sequenceName = "PROMOTION_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "CODE", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "DESCRIPTION", length = 255)
    private String description;

    @Column(name = "DISCOUNT_TYPE", nullable = false, length = 20)
    private String discountType;

    @Column(name = "DISCOUNT_VALUE", nullable = false)
    private Double discountValue;

    @Column(name = "MAX_DISCOUNT")
    private Double maxDiscount;

    @Column(name = "START_DATE", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "END_DATE", nullable = false)
    private LocalDateTime endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AIRLINE_ID")
    @JsonIgnore
    private Airline airline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ROUTE_ID")
    @JsonIgnore
    private Route route;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CUSTOMER_ID")
    @JsonIgnore
    private User customer;

    @Column(name = "MIN_FARE")
    private Double minFare;

    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
