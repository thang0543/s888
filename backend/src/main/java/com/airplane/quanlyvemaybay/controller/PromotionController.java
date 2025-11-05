package com.airplane.quanlyvemaybay.controller;

import com.airplane.quanlyvemaybay.entity.Promotion;
import com.airplane.quanlyvemaybay.request.PromotionReq;
import com.airplane.quanlyvemaybay.respone.PromotionRes;
import com.airplane.quanlyvemaybay.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @PostMapping
    public ResponseEntity<String> addPromotion(@RequestBody PromotionReq req) {
        int result = promotionService.addPromotion(req);
        if (result == 1)
            return ResponseEntity.ok("Thêm khuyến mãi thành công");
        return ResponseEntity.badRequest().body("Thêm khuyến mãi thất bại");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updatePromotion(@PathVariable long id, @RequestBody PromotionReq req) {
        int result = promotionService.updatePromotion(id, req);
        if (result == 1)
            return ResponseEntity.ok("Cập nhật khuyến mãi thành công");
        return ResponseEntity.badRequest().body("Cập nhật khuyến mãi thất bại");
    }

    @DeleteMapping("/{id}/status")
    public ResponseEntity<String> updateStatus(@PathVariable long id) {
        int result = promotionService.updateStatus(id);
        if (result == 1)
            return ResponseEntity.ok("Cập nhật trạng thái khuyến mãi thành công");
        return ResponseEntity.badRequest().body("Cập nhật trạng thái thất bại");
    }
}
