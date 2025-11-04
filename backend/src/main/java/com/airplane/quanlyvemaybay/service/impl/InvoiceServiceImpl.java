package com.airplane.quanlyvemaybay.service.impl;

import com.airplane.quanlyvemaybay.entity.*;
import com.airplane.quanlyvemaybay.repository.*;
import com.airplane.quanlyvemaybay.request.BookingPaymentRequestDTO;
import com.airplane.quanlyvemaybay.request.PassengerDTO;
import com.airplane.quanlyvemaybay.respone.*;
import com.airplane.quanlyvemaybay.service.InvoiceService;
import com.airplane.quanlyvemaybay.service.RouteSegmentService;
import com.airplane.quanlyvemaybay.service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InvoiceServiceImpl implements InvoiceService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private PassengerRepository passengerRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private AirlineRepository airlineRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private RouteSegmentService routeSegmentService;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    @Override
    public List<Map<String, Object>> findAllInvoiceSummaries(Long airlineId, Long routeId, Long customerId) {
        return invoiceRepository.findInvoiceSummariesOracle(airlineId, routeId, customerId);
    }

    @Transactional
    public Payment createBookingTransaction(BookingPaymentRequestDTO req) {
        User customer = userRepository.findById(req.getCustomerId())
                .orElse(null);
        Promotion promotion = promotionRepository.findById(req.getPromotionId()).orElse(null);
        Invoice invoice = Invoice.builder()
                .invoiceCode("INV-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .customer(customer)
                .currency(req.getSummary().getCurrency())
                .totalAmount(req.getSummary().getTotalAmount())
                .status(req.getStatus())
                .promotion(promotion)
                .issuedAt(LocalDateTime.now())
                .discountAmount(req.getSummary().getDiscountAmount())
                .build();

        invoiceRepository.save(invoice);

        Payment payment = Payment.builder()
                .paymentCode(UUID.randomUUID().toString().substring(0, 10).toUpperCase())
                .method(req.getPaymentMethod())
                .amount(req.getSummary().getTotalAmount())
                .currency(req.getSummary().getCurrency())
                .status("SUCCESS")
                .invoice(invoice)
                .transactionId(req.getTransactionId())
                .paymentDate(LocalDateTime.now())
                .build();

        if(req.getStatus().equals("PAIN")){
            paymentRepository.save(payment);
        }

        Flight flight = flightRepository.findByCode(req.getFlight().getCode())
                .orElseGet(() -> {
                    Airline airline = airlineRepository.findByCode(req.getFlight().getAirline())
                            .orElseThrow(() ->
                                    new RuntimeException("❌ Airline not found: " + req.getFlight().getAirline())
                            );

                    Route route = routeRepository.findByName(req.getFlight().getFrom() + " → " + req.getFlight().getTo())
                            .orElseGet(() -> {
                                Route newRoute = Route.builder()
                                        .name(req.getFlight().getFrom() + " → " + req.getFlight().getTo())
                                        .build();

                                RouteSegment segment = RouteSegment.builder()
                                        .route(newRoute)
                                        .fromAirport(req.getFlight().getFrom())
                                        .toAirport(req.getFlight().getTo())
                                        .sequence(1)
                                        .flightDuration(0)
                                        .stopType("DIRECT")
                                        .build();

                                newRoute.setSegments(List.of(segment));
                                return routeSegmentService.addRouter(newRoute);
                            });

                    User defaultStaff = userService.findById(1L)
                            .orElseThrow(() -> new RuntimeException("Default staff not found"));
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

                    Flight newFlight = Flight.builder()
                            .duration(req.getFlight().getDuration())
                            .carrierCode(req.getFlight().getCarrierCode())
                            .aircraftCode(req.getFlight().getAircraftCode())
                            .departureTime(LocalDateTime.parse(req.getFlight().getDepartureTime(), formatter))
                            .arrivalTime(LocalDateTime.parse(req.getFlight().getArrivalTime(), formatter))
                            .airline(airline)
                            .route(route)
                            .price(req.getFlight().getBasePrice())
                            .code(req.getFlight().getCode())
                            .staff(defaultStaff)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();

                    return flightRepository.save(newFlight);
                });



        List<Ticket> tickets = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        for (PassengerDTO p : req.getPassengers()) {
            Passenger passenger = passengerRepository.save(
                    Passenger.builder()
                            .fullName(p.getFullName())
                            .email(p.getEmail())
                            .passportNumber(p.getPassportNo())
                            .nationality(p.getCountry())
                            .phoneNumber(p.getPhone())
                            .type(p.getType())
                            .seat(p.getSeat())
                            .seatPrice(p.getSeatPrice())
                            .dob(p.getDob().equals("") ? null : LocalDate.parse(p.getDob(), formatter).atStartOfDay())
                            .createdAt(LocalDateTime.now())
                            .build()
            );

            double seatPrice = 0D;
            if (p.getSeatPrice() != null) {
                seatPrice = convertCurrency(p.getSeatPrice(), p.getPriceFlight());
            }

            Ticket ticket = Ticket.builder()
                    .passenger(passenger)
                    .flight(flight)
                    .invoice(invoice)
                    .seatNumber(p.getSeat())
                    .flightClass("ECONOMY")
                    .price(req.getFlight().getBasePrice() + seatPrice)
                    .bookingDate(LocalDateTime.now())
                    .createdAt(LocalDateTime.now())
                    .build();

            tickets.add(ticket);
        }

        ticketRepository.saveAll(tickets);
        invoice.setTickets(tickets);
        invoiceRepository.save(invoice);

        return payment;
    }

    @Transactional
    public InvoiceBookingResDTO getBookingInvoice(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        List<PaymentResDTO> payment = paymentRepository.findAllByInvoiceId(invoiceId).stream()
                .map(p -> PaymentResDTO.builder()
                        .id(p.getId())
                        .paymentCode(p.getPaymentCode())
                        .method(p.getMethod())
                        .amount(p.getAmount())
                        .currency(p.getCurrency())
                        .status(p.getStatus())
                        .transactionId(p.getTransactionId())
                        .paymentDate(p.getPaymentDate())
                        .build()
                ).collect(Collectors.toList());;
        Flight flight = invoice.getTickets().get(0).getFlight();
        Airline airline = flight.getAirline();
        Route route = flight.getRoute();
        User customer = invoice.getCustomer();
        List<PassengerInfoRes> passengerInfos = invoice.getTickets().stream()
                .map(t -> {
                    Passenger p = t.getPassenger();
                    return PassengerInfoRes.builder()
                            .idTicket(t.getId())
                            .id(p.getId())
                            .fullName(p.getFullName())
                            .type(p.getType())
                            .passportNo(p.getPassportNumber())
                            .seat(t.getSeatNumber())
                            .seatPrice(Double.parseDouble(p.getSeatPrice()))
                            .email(p.getEmail())
                            .phone(p.getPhoneNumber())
                            .dob(p.getDob() != null ? p.getDob().toLocalDate().toString(): null)
                            .country(p.getNationality())
                            .address("N/A")
                            .priceFlight(flight.getPrice())
                            .build();
                }).toList();

        long adultCount = passengerInfos.stream().filter(p -> "adult".equalsIgnoreCase(p.getType())).count();
        long childCount = passengerInfos.stream().filter(p -> "child".equalsIgnoreCase(p.getType())).count();
        long infantCount = passengerInfos.stream().filter(p -> "infant".equalsIgnoreCase(p.getType())).count();

        SummaryRes summary = SummaryRes.builder()
                .adultCount((int) adultCount)
                .childCount((int) childCount)
                .infantCount((int) infantCount)
                .discount(invoice.getDiscountAmount())
                .baseAmount(flight.getPrice())
                .seatTotal(passengerInfos.stream().mapToDouble(p -> Optional.ofNullable(p.getSeatPrice()).orElse(0.0)).sum())
                .totalAmount(invoice.getTotalAmount())
                .currency(invoice.getCurrency())
                .build();

        RouteSegment firstSegment = route.getSegments().stream()
                .min(Comparator.comparing(RouteSegment::getSequence))
                .orElse(null);

        RouteSegment lastSegment = route.getSegments().stream()
                .max(Comparator.comparing(RouteSegment::getSequence))
                .orElse(null);

        FlightInfoRes flightInfo = FlightInfoRes.builder()
                .id(flight.getId())
                .code(flight.getCode())
                .airline(airline.getName())
                .from(firstSegment != null ? firstSegment.getFromAirport() : null)
                .to(lastSegment != null ? lastSegment.getToAirport() : null)
                .departureTime(flight.getDepartureTime())
                .arrivalTime(flight.getArrivalTime())
                .basePrice(flight.getPrice())
                .duration(flight.getDuration())
                .carrierCode(flight.getCarrierCode())
                .aircraftCode(flight.getAircraftCode())
                .build();

        return InvoiceBookingResDTO.builder()
                .id(invoice.getInvoiceCode())
                .createdAt(invoice.getIssuedAt())
                .customerId(invoice.getCustomer() != null ? invoice.getCustomer().getId(): null)
                .flight(flightInfo)
                .passengers(passengerInfos)
                .customer(customer)
                .summary(summary)
                .payment(payment)
                .build();
    }

    @Override
    @Transactional
    public void deleteBookingInvoice(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("không tìm thấy hóa đơn"));
        if (!"TEMP".equalsIgnoreCase(invoice.getStatus())) {
            throw new RuntimeException("Chỉ có thể xóa hóa đơn lưu tạm thời (TEMP)");
        }
        List<Ticket> tickets = ticketRepository.findAllByInvoiceId(invoiceId);
        for (Ticket t : tickets) {
            Passenger p = t.getPassenger();
            ticketRepository.delete(t);
            if (p != null) passengerRepository.delete(p);
        }

        List<Payment> payments = paymentRepository.findAllByInvoiceId(invoiceId);
        for (Payment t : payments) {
            paymentRepository.delete(t);
        }
        invoiceRepository.delete(invoice);
    }
    public double convertCurrency(String baseAmount, String extraAmount) {
        return Double.parseDouble(baseAmount) + Double.parseDouble(extraAmount);
    }

    @Transactional
    public Payment updateBookingTransaction(Long invoiceId, BookingPaymentRequestDTO req) {
        Invoice existingInvoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("❌ Invoice not found with id: " + invoiceId));

        User customer = userRepository.findById(req.getCustomerId())
                .orElseThrow(() -> new RuntimeException("❌ Customer not found"));
        double oldTotal = existingInvoice.getTotalAmount();

        existingInvoice.setCustomer(customer);
        existingInvoice.setCurrency(req.getSummary().getCurrency());
        existingInvoice.setTotalAmount(req.getSummary().getTotalAmount());
        existingInvoice.setStatus("PAIN");
        existingInvoice.setStatus(req.getStatus());
        invoiceRepository.save(existingInvoice);

        Flight flight = flightRepository.findByCode(req.getFlight().getCode())
                .orElseGet(() -> {
                    Airline airline = airlineRepository.findByCode(req.getFlight().getAirline())
                            .orElseThrow(() ->
                                    new RuntimeException("❌ Airline not found: " + req.getFlight().getAirline())
                            );

                    Route route = routeRepository.findByName(req.getFlight().getFrom() + " → " + req.getFlight().getTo())
                            .orElseGet(() -> {
                                Route newRoute = Route.builder()
                                        .name(req.getFlight().getFrom() + " → " + req.getFlight().getTo())
                                        .build();

                                RouteSegment segment = RouteSegment.builder()
                                        .route(newRoute)
                                        .fromAirport(req.getFlight().getFrom())
                                        .toAirport(req.getFlight().getTo())
                                        .sequence(1)
                                        .flightDuration(0)
                                        .stopType("DIRECT")
                                        .build();

                                newRoute.setSegments(List.of(segment));
                                return routeSegmentService.addRouter(newRoute);
                            });

                    User defaultStaff = userService.findById(1L)
                            .orElseThrow(() -> new RuntimeException("Default staff not found"));
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

                    Flight newFlight = Flight.builder()
                            .duration(req.getFlight().getDuration())
                            .carrierCode(req.getFlight().getCarrierCode())
                            .aircraftCode(req.getFlight().getAircraftCode())
                            .departureTime(LocalDateTime.parse(req.getFlight().getDepartureTime(), formatter))
                            .arrivalTime(LocalDateTime.parse(req.getFlight().getArrivalTime(), formatter))
                            .airline(airline)
                            .route(route)
                            .price(req.getFlight().getBasePrice())
                            .code(req.getFlight().getCode())
                            .staff(defaultStaff)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();

                    return flightRepository.save(newFlight);
                });

        List<Ticket> oldTickets = ticketRepository.findAllByInvoiceId(invoiceId);
        for (Ticket t : oldTickets) {
            Passenger p = t.getPassenger();
            ticketRepository.delete(t);
            if (p != null) passengerRepository.delete(p);
        }

        List<Ticket> newTickets = new ArrayList<>();
        DateTimeFormatter dobFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (PassengerDTO p : req.getPassengers()) {
            Passenger passenger = passengerRepository.save(
                    Passenger.builder()
                            .fullName(p.getFullName())
                            .email(customer.getEmail())
                            .passportNumber(p.getPassportNo())
                            .nationality(p.getCountry())
                            .phoneNumber(p.getPhone())
                            .type(p.getType())
                            .seat(p.getSeat())
                            .seatPrice(p.getSeatPrice())
                            .dob(p.getDob().equals("") ? null : LocalDate.parse(p.getDob(), dobFormatter).atStartOfDay())
                            .createdAt(LocalDateTime.now())
                            .build()
            );

            double seatPrice = 0D;
            if (p.getSeatPrice() != null) {
                seatPrice = convertCurrency(p.getSeatPrice(), p.getPriceFlight());
            }

            Ticket ticket = Ticket.builder()
                    .passenger(passenger)
                    .flight(flight)
                    .invoice(existingInvoice)
                    .seatNumber(p.getSeat())
                    .flightClass("ECONOMY")
                    .price(req.getFlight().getBasePrice() + seatPrice)
                    .bookingDate(LocalDateTime.now())
                    .createdAt(LocalDateTime.now())
                    .build();

            newTickets.add(ticket);
        }

        ticketRepository.saveAll(newTickets);
        existingInvoice.setTickets(newTickets);
        invoiceRepository.save(existingInvoice);
        double extraAmount = req.getSummary().getTotalAmount() - oldTotal;
        boolean needNewPayment = extraAmount != 0
                || (req.getPaymentMethod() != null && !req.getPaymentMethod().isEmpty());

        Payment payment = null;
        if (needNewPayment) {
            payment = Payment.builder()
                    .invoice(existingInvoice)
                    .paymentCode("PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .method(req.getPaymentMethod())
                    .amount(extraAmount > 0 ? extraAmount : 0)
                    .currency(req.getSummary().getCurrency())
                    .status(extraAmount > 0 ? "PENDING" : "SUCCESS")
                    .transactionId(req.getTransactionId())
                    .paymentDate(LocalDateTime.now())
                    .build();

            paymentRepository.save(payment);
        }


        return payment;
    }

}
