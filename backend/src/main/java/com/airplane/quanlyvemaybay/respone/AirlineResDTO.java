package com.airplane.quanlyvemaybay.respone;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AirlineResDTO {

    private Long id;
    private String name;
}
