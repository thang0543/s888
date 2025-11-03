package com.airplane.quanlyvemaybay.service.impl;

import com.airplane.quanlyvemaybay.repository.PromotionRepository;
import com.airplane.quanlyvemaybay.respone.PromotionRes;
import com.airplane.quanlyvemaybay.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PromotionServiceImpl implements PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    @Override
    public List<PromotionRes> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .map(p -> new PromotionRes(
                        p.getId(),
                        p.getCode(),
                        p.getDescription(),
                        p.getDiscountType(),
                        p.getDiscountValue(),
                        p.getMaxDiscount(),
                        p.getStartDate(),
                        p.getEndDate(),
                        p.getAirline() != null ? p.getAirline().getId() : null,
                        p.getAirline() != null ? p.getAirline().getCode() : null,
                        p.getRoute() != null ? p.getRoute().getName() : null,
                        p.getMinFare(),
                        p.getIsActive()
                ))
                .toList();
    }
}
