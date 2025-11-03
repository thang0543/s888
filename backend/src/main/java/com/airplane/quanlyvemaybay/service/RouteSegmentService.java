package com.airplane.quanlyvemaybay.service;

import com.airplane.quanlyvemaybay.entity.Route;
import com.airplane.quanlyvemaybay.entity.RouteSegment;
import com.airplane.quanlyvemaybay.respone.RouterResDTO;

import java.util.List;

public interface RouteSegmentService {

    List<RouterResDTO> getAllRouter();

    Route addRouter(Route route);

    Route updateRouter(Route route);

    void deleteRouter(long id);
}
