package com.airplane.quanlyvemaybay.controller;

import com.airplane.quanlyvemaybay.entity.Promotion;
import com.airplane.quanlyvemaybay.respone.PromotionRes;
import com.airplane.quanlyvemaybay.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = "*")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    @GetMapping
    public List<PromotionRes> getAllPromotions() {
        return promotionService.getAllPromotions();
    }


}
