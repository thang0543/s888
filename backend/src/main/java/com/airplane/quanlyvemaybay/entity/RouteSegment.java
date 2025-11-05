package com.airplane.quanlyvemaybay.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "route_segments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RouteSegment {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "route_segment_seq")
    @SequenceGenerator(name = "route_segment_seq", sequenceName = "ROUTE_SEGMENT_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @Column(nullable = false)
    private String fromAirport;

    @Column(nullable = false)
    private String toAirport;

    @Column(nullable = false)
    private Integer sequence;

    @Column(nullable = false)
    private Integer flightDuration;

    @Column(nullable = false)
    private String stopType;

    private Integer stopDuration;

    @CreationTimestamp
    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

}