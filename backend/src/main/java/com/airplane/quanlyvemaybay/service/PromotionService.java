package com.airplane.quanlyvemaybay.service;

import com.airplane.quanlyvemaybay.entity.Promotion;
import com.airplane.quanlyvemaybay.request.PromotionReq;
import com.airplane.quanlyvemaybay.respone.PromotionRes;

import java.util.List;

public interface PromotionService {
     List<PromotionRes> getAllPromotions();
     int addPromotion(PromotionReq req);
     int updatePromotion(long id, PromotionReq req);
     int updateStatus(long id);
}
