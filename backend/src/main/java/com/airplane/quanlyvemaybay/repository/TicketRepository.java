package com.airplane.quanlyvemaybay.repository;

import com.airplane.quanlyvemaybay.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByPassengerId(Long passengerId);
    List<Ticket> findByFlightId(Long flightId);
    List<Ticket> findAllByInvoiceId(Long flightId);

}
