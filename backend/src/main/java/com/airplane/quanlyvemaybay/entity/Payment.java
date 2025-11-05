package com.airplane.quanlyvemaybay.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "PAYMENT")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "payment_seq_gen")
    @SequenceGenerator(name = "payment_seq_gen", sequenceName = "PAYMENT_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "PAYMENT_CODE", nullable = false, unique = true)
    private String paymentCode;

    @Column(name = "METHOD", nullable = false)
    private String method;

    @Column(name = "AMOUNT", nullable = false)
    private Double amount;

    @Column(name = "CURRENCY", nullable = false)
    private String currency;

    @Column(name = "STATUS", nullable = false)
    private String status;

    @Column(name = "TRANSACTION_ID")
    private String transactionId;

    @Column(name = "PAYMENT_DATE")
    private LocalDateTime paymentDate;

    @ManyToOne
    @JoinColumn(name = "INVOICE_ID")
    private Invoice invoice;

    @CreationTimestamp
    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
}
