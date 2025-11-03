package com.airplane.quanlyvemaybay.controller;

import com.airplane.quanlyvemaybay.entity.Route;
import com.airplane.quanlyvemaybay.respone.RouterResDTO;
import com.airplane.quanlyvemaybay.service.RouteSegmentService;
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
@RequestMapping("/api/router")
@CrossOrigin(origins = "*")
public class RouterController {


    @Autowired
    private RouteSegmentService routeSegmentService;


    @GetMapping
    public ResponseEntity<List<RouterResDTO>> getAllRoutes() {
        return ResponseEntity.ok(routeSegmentService.getAllRouter());
    }

    @PostMapping
    public ResponseEntity<Route> addRoute(@RequestBody Route route) {
        return ResponseEntity.ok(routeSegmentService.addRouter(route));
    }

    @PutMapping
    public ResponseEntity<Route> updateRoute(@RequestBody Route route) {
        return ResponseEntity.ok(routeSegmentService.updateRouter(route));
    }

    @DeleteMapping("/{id}")
    public void deleteRoute(@PathVariable long id) {
        routeSegmentService.deleteRouter(id);
    }
}
