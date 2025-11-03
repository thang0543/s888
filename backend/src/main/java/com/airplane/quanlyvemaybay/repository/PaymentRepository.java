package com.airplane.quanlyvemaybay.repository;

import com.airplane.quanlyvemaybay.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findAllByInvoiceId(Long invoiceId);
}
