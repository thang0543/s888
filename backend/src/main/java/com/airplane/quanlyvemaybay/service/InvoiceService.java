package com.airplane.quanlyvemaybay.service;

import com.airplane.quanlyvemaybay.entity.Payment;
import com.airplane.quanlyvemaybay.request.BookingPaymentRequestDTO;
import com.airplane.quanlyvemaybay.respone.InvoiceBookingResDTO;
import com.airplane.quanlyvemaybay.respone.InvoiceSummaryDTO;

import java.util.List;
import java.util.Map;

public interface InvoiceService {

    List<Map<String, Object>> findAllInvoiceSummaries(Long airlineId, Long routeId, Long customerId);

    Payment createBookingTransaction(BookingPaymentRequestDTO request);

    InvoiceBookingResDTO getBookingInvoice(Long invoiceId);

    Payment updateBookingTransaction(Long invoiceId, BookingPaymentRequestDTO req);

    void deleteBookingInvoice(Long invoiceId);
}
