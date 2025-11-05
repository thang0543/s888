package com.airplane.quanlyvemaybay.request;

import com.airplane.quanlyvemaybay.entity.Airline;
import com.airplane.quanlyvemaybay.entity.Route;
import com.airplane.quanlyvemaybay.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PromotionReq {

    private String code;

    private String description;

    private String discountType;

    private Double discountValue;

    private Double maxDiscount;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private long airlineId;

    private long routerId;

    private long customerId;

    private Double minFare;

    private Boolean isActive = true;

}
