package com.airplane.quanlyvemaybay.repository;

import com.airplane.quanlyvemaybay.entity.RouteSegment;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteSegmentRepository extends JpaRepository<RouteSegment, Long> {
    List<RouteSegment> findByRouteId(Long routeId);

    @Modifying
    @Transactional
    @Query("DELETE FROM RouteSegment rs WHERE rs.route.id = :routeId")
    void deleteByRouteId(@Param("routeId") Long routeId);
}
