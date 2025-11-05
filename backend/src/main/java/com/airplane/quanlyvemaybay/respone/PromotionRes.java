package com.airplane.quanlyvemaybay.respone;

import com.airplane.quanlyvemaybay.entity.Airline;
import com.airplane.quanlyvemaybay.entity.Route;
import com.airplane.quanlyvemaybay.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PromotionRes {
    private Long id;

    private String code;

    private String description;

    private String discountType;

    private Double discountValue;

    private Double maxDiscount;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Long airlineId;

    private String airlineName;

   private String nameRouter;

   private Long routerId;

   private Long customId;

    private Double minFare;

    private Boolean isActive = true;


}
