package com.airplane.quanlyvemaybay.respone;

import com.airplane.quanlyvemaybay.entity.Airline;
import com.airplane.quanlyvemaybay.entity.Route;
import com.airplane.quanlyvemaybay.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.time.LocalDateTime;

public class PromotionResDTO {

    private Long id;

    private String code;

    private String description;

    private String discountType;

    private Double discountValue;

    private Double maxDiscount;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Double minFare;

    private Boolean isActive = true;
}
