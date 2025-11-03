package com.airplane.quanlyvemaybay.service;

import com.airplane.quanlyvemaybay.entity.Ticket;

import java.util.List;
import java.util.Optional;

public interface TicketService {
    List<Ticket> findAll();
    Optional<Ticket> findById(Long id);
    Ticket save(Ticket ticket);
    void deleteById(Long id);
}
