package com.airplane.quanlyvemaybay.controller;

import com.airplane.quanlyvemaybay.entity.Payment;
import com.airplane.quanlyvemaybay.request.BookingPaymentRequestDTO;
import com.airplane.quanlyvemaybay.respone.InvoiceBookingResDTO;
import com.airplane.quanlyvemaybay.respone.InvoiceSummaryDTO;
import com.airplane.quanlyvemaybay.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoice")
@CrossOrigin(origins = "*")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @GetMapping
    public List<Map<String, Object>> getInvoices(
            @RequestParam(required = false) Long airlineId,
            @RequestParam(required = false) Long routeId,
            @RequestParam(required = false) Long customerId
    ) {
        List<Map<String, Object>> invoices = invoiceService.findAllInvoiceSummaries(airlineId, routeId, customerId);
        return invoices;
    }

    @GetMapping("/{id}/booking")
    public InvoiceBookingResDTO getInvoiceBooking(@PathVariable Long id) {
        return invoiceService.getBookingInvoice(id);
    }

    @PutMapping("/{id}")
    public Payment updateBookingTransaction(@PathVariable("id") Long invoiceId,@RequestBody BookingPaymentRequestDTO req){
        return invoiceService.updateBookingTransaction(invoiceId, req);
    }

    @PostMapping
    public  Payment createBookingTransaction(@RequestBody  BookingPaymentRequestDTO request){
        return invoiceService.createBookingTransaction(request);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteBookingInvoice(@PathVariable Long id) {
        invoiceService.deleteBookingInvoice(id);
    }
}
