package com.airplane.quanlyvemaybay.service.impl;

import com.airplane.quanlyvemaybay.entity.Airline;
import com.airplane.quanlyvemaybay.entity.Promotion;
import com.airplane.quanlyvemaybay.entity.Route;
import com.airplane.quanlyvemaybay.entity.User;
import com.airplane.quanlyvemaybay.repository.AirlineRepository;
import com.airplane.quanlyvemaybay.repository.PromotionRepository;
import com.airplane.quanlyvemaybay.repository.RouteRepository;
import com.airplane.quanlyvemaybay.repository.UserRepository;
import com.airplane.quanlyvemaybay.request.PromotionReq;
import com.airplane.quanlyvemaybay.respone.PromotionRes;
import com.airplane.quanlyvemaybay.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PromotionServiceImpl implements PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private AirlineRepository airlineRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RouteRepository routeRepository;


    @Override
    public List<PromotionRes> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .filter(p -> "Y".equalsIgnoreCase(p.getStatus()))
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
                        p.getRoute() != null ? p.getRoute().getId() : null,
                        p.getCustomer() != null ? p.getCustomer().getId() : null,
                        p.getMinFare(),
                        p.getIsActive()
                ))
                .toList();
    }

    @Override
    public int addPromotion(PromotionReq req) {
        try {
            Airline airline = airlineRepository.findById(req.getAirlineId())
                    .orElse(null);
            Route route = routeRepository.findById(req.getRouterId())
                    .orElse(null);
            User customer = userRepository.findById(req.getCustomerId())
                    .orElse(null);

            Promotion promotion = Promotion.builder()
                    .code(req.getCode())
                    .description(req.getDescription())
                    .discountType(req.getDiscountType())
                    .discountValue(req.getDiscountValue())
                    .maxDiscount(req.getMaxDiscount())
                    .startDate(req.getStartDate())
                    .endDate(req.getEndDate())
                    .airline(airline)
                    .route(route)
                    .customer(customer)
                    .minFare(req.getMinFare())
                    .isActive(req.getIsActive())
                    .status("Y")
                    .build();

            promotionRepository.save(promotion);
            return 1;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public int updatePromotion(long id, PromotionReq req) {
        try {
            Promotion existing = promotionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Promotion not found"));

            Airline airline = airlineRepository.findById(req.getAirlineId())
                    .orElse(null);
            Route route = routeRepository.findById(req.getRouterId())
                    .orElse(null);
            User customer = userRepository.findById(req.getCustomerId())
                    .orElse(null);

            existing.setCode(req.getCode());
            existing.setDescription(req.getDescription());
            existing.setDiscountType(req.getDiscountType());
            existing.setDiscountValue(req.getDiscountValue());
            existing.setMaxDiscount(req.getMaxDiscount());
            existing.setStartDate(req.getStartDate());
            existing.setEndDate(req.getEndDate());
            existing.setAirline(airline);
            existing.setRoute(route);
            existing.setCustomer(customer);
            existing.setMinFare(req.getMinFare());
            existing.setIsActive(req.getIsActive());

            promotionRepository.save(existing);
            return 1;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public int updateStatus(long id) {
        Promotion promotion = promotionRepository.findById(id).get();
        promotion.setStatus("N");
        promotionRepository.save(promotion);
        return 1;
    }
}
