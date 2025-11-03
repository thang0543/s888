package com.airplane.quanlyvemaybay.respone;

import com.airplane.quanlyvemaybay.entity.RouteSegment;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RouterResDTO {

    private Long id;

    private String name;

    private List<RouteSegmentResDTO> segments;

}
