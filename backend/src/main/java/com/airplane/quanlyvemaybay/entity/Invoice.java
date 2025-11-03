package com.airplane.quanlyvemaybay.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "INVOICE")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "invoice_seq_gen")
    @SequenceGenerator(name = "invoice_seq_gen", sequenceName = "INVOICE_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "INVOICE_CODE", nullable = false, unique = true)
    private String invoiceCode;

    @ManyToOne
    @JoinColumn(name = "CUSTOMER_ID")
    private User customer;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL)
    private List<Payment> payments;

    @Column(name = "TOTAL_AMOUNT", nullable = false)
    private Double totalAmount;

    @Column(name = "DISCOUNT_AMOUNT")
    private Double discountAmount;

    @Column(name = "CURRENCY", nullable = false)
    private String currency;

    @Column(name = "STATUS")
    private String status;

    @Column(name = "ISSUED_AT")
    private LocalDateTime issuedAt;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Ticket> tickets = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROMOTION_ID", nullable = true)
    private Promotion promotion;

}