package com.airplane.quanlyvemaybay.service.impl;

import com.airplane.quanlyvemaybay.entity.Route;
import com.airplane.quanlyvemaybay.entity.RouteSegment;
import com.airplane.quanlyvemaybay.repository.RouteRepository;
import com.airplane.quanlyvemaybay.repository.RouteSegmentRepository;
import com.airplane.quanlyvemaybay.respone.RouteSegmentResDTO;
import com.airplane.quanlyvemaybay.respone.RouterResDTO;
import com.airplane.quanlyvemaybay.service.RouteSegmentService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RouteSegmentServiceImpl implements RouteSegmentService {

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private RouteSegmentRepository routeSegmentRepository;

    @Override
    public List<RouterResDTO> getAllRouter() {
        List<Route> routes = routeRepository.findAll();
        return routes.stream()
                .map(this::mapToRouterResDTO)
                .collect(Collectors.toList());
    }

    private RouterResDTO mapToRouterResDTO(Route route) {
        List<RouteSegmentResDTO> segDtos = route.getSegments().stream()
                .map(seg -> RouteSegmentResDTO.builder()
                        .fromAirport(seg.getFromAirport())
                        .toAirport(seg.getToAirport())
                        .sequence(seg.getSequence())
                        .flightDuration(seg.getFlightDuration())
                        .stopType(seg.getStopType())
                        .stopDuration(seg.getStopDuration())
                        .build())
                .collect(Collectors.toList());

        return RouterResDTO.builder()
                .id(route.getId())
                .name(route.getName())
                .segments(segDtos)
                .build();
    }

    @Override
    @Transactional
    public Route addRouter(Route route) {
        if (route.getSegments() != null) {
            for (RouteSegment seg : route.getSegments()) {
                seg.setRoute(route);
            }
        }
        return routeRepository.save(route);
    }

    @Override
    public Route updateRouter(Route route) {
        Route route1 = routeRepository.save(route);
        routeSegmentRepository.deleteByRouteId(route.getId());
        routeSegmentRepository.saveAll(route.getSegments());
        return route1;
    }

    @Override
    public void deleteRouter(long id) {
        routeRepository.deleteById(id);
    }
}
