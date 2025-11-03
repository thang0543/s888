package com.airplane.quanlyvemaybay.repository;

import com.airplane.quanlyvemaybay.entity.Invoice;
import com.airplane.quanlyvemaybay.respone.InvoiceSummaryDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    @Query(value = """
                SELECT
                    i.id AS "invoiceId",
                    i.invoice_code AS "invoiceNumber",
                    i.issued_at AS "invoiceDate",
                    c.full_name AS "customerName",
                    f.code AS "flightCode",
                    f.departure_time AS "departureTime",
                    f.arrival_time AS "arrivalTime",
                    a.name AS "airlineName",
                    (
                        (SELECT from_airport
                         FROM route_segments
                         WHERE route_id = r.id
                         ORDER BY sequence ASC
                         FETCH FIRST 1 ROW ONLY)
                        || ' - ' ||
                        (SELECT to_airport
                         FROM route_segments
                         WHERE route_id = r.id
                         ORDER BY sequence DESC
                         FETCH FIRST 1 ROW ONLY)
                    ) AS "route",
                    (TO_CHAR(i.total_amount) || ' ' || i.currency) AS "totalAmountCurrency",

                    CASE 
                        WHEN t.class = 'ECONOMY' THEN 
                            (a.economy_commission + p.seat_price - a.ticket_issuance_fee - i.discount_amount)
                        WHEN t.class = 'BUSINESS' THEN 
                            (a.business_commission + p.seat_price - a.ticket_issuance_fee - i.discount_amount)
                        ELSE 0
                    END AS "profit",
                   (TO_CHAR(i.discount_amount) || ' ' || i.currency)  AS "discountAmount",
                    i.status AS "status"
                FROM invoice i
               LEFT JOIN users c ON i.customer_id = c.id
               LEFT JOIN ticket t ON t.invoice_id = i.id
               LEFT JOIN flight f ON t.flight_id = f.id
               LEFT JOIN airlines a ON f.airline_id = a.id
               LEFT JOIN routes r ON f.route_id = r.id
               LEFT JOIN PASSENGERS p ON p.id = t.PASSENGER_ID
                WHERE (:airlineId IS NULL OR a.id = :airlineId)
                  AND (:routeId IS NULL OR r.id = :routeId)
                  AND (:customerId IS NULL OR c.id = :customerId)
            """, nativeQuery = true)
    List<Map<String, Object>> findInvoiceSummariesOracle(
            @Param("airlineId") Long airlineId,
            @Param("routeId") Long routeId,
            @Param("customerId") Long customerId
    );
}
