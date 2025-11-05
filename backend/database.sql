-- Drop tables
DROP TABLE airlines CASCADE CONSTRAINTS;
DROP TABLE flight CASCADE CONSTRAINTS;
DROP TABLE invoice CASCADE CONSTRAINTS;
DROP TABLE passengers CASCADE CONSTRAINTS;
DROP TABLE payment CASCADE CONSTRAINTS;
DROP TABLE promotion CASCADE CONSTRAINTS;
DROP TABLE route_segments CASCADE CONSTRAINTS;
DROP TABLE routes CASCADE CONSTRAINTS;
DROP TABLE ticket CASCADE CONSTRAINTS;
DROP TABLE users CASCADE CONSTRAINTS;

-- Drop sequences
DROP SEQUENCE airlines_seq;
DROP SEQUENCE flight_seq;
DROP SEQUENCE invoice_seq;
DROP SEQUENCE passengers_seq;
DROP SEQUENCE payment_seq;
DROP SEQUENCE promotion_seq;
DROP SEQUENCE route_segment_seq;
DROP SEQUENCE route_seq;
DROP SEQUENCE ticket_seq;
DROP SEQUENCE users_seq;

CREATE SEQUENCE airlines_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE flight_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE invoice_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE passengers_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE payment_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE promotion_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE route_segment_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE route_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE ticket_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE users_seq START WITH 1 INCREMENT BY 1;

-- -------------------------------
-- TABLE: airlines
-- -------------------------------
CREATE TABLE airlines (
                          id NUMBER(19,0) PRIMARY KEY,
                          name VARCHAR2(255 CHAR) NOT NULL,
                          code VARCHAR2(255 CHAR),
                          country VARCHAR2(255 CHAR) NOT NULL,
                          manufacturner VARCHAR2(255 CHAR) NOT NULL,
                          model VARCHAR2(255 CHAR) NOT NULL,
                          capacity VARCHAR2(255 CHAR) NOT NULL,
                          description VARCHAR2(255 CHAR),
                          ticket_issuance_fee FLOAT(53),
                          economy_commission FLOAT(53),
                          business_commission FLOAT(53),
                          change_fee FLOAT(53),
                          created_at TIMESTAMP(6),
                          updated_at TIMESTAMP(6)
);

-- -------------------------------
-- TABLE: users
-- -------------------------------
CREATE TABLE users (
                       id NUMBER(19,0) PRIMARY KEY,
                       email VARCHAR2(255 CHAR) NOT NULL,
                       full_name VARCHAR2(255 CHAR) NOT NULL,
                       password VARCHAR2(255 CHAR) NOT NULL,
                       phone_number VARCHAR2(255 CHAR) NOT NULL,
                       role VARCHAR2(255 CHAR),
                       dob TIMESTAMP(6),
                       created_at TIMESTAMP(6),
                       updated_at TIMESTAMP(6)
);

-- -------------------------------
-- TABLE: routes
-- -------------------------------
CREATE TABLE routes (
                        id NUMBER(19,0) PRIMARY KEY,
                        name VARCHAR2(255 CHAR) NOT NULL,
                         created_at TIMESTAMP(6),
                        updated_at TIMESTAMP(6)
);

-- -------------------------------
-- TABLE: promotion
-- -------------------------------
CREATE TABLE promotion (
                           id NUMBER(19,0) PRIMARY KEY,
                           code VARCHAR2(50 CHAR) NOT NULL UNIQUE,
                           discount_type VARCHAR2(20 CHAR) NOT NULL,
                           discount_value FLOAT(53) NOT NULL,
                           min_fare FLOAT(53),
                           max_discount FLOAT(53),
                           airline_id NUMBER(19,0),
                           route_id NUMBER(19,0),
                           customer_id NUMBER(19,0),
                           start_date TIMESTAMP(6) NOT NULL,
                           end_date TIMESTAMP(6) NOT NULL,
                           description VARCHAR2(255 CHAR),
                           is_active NUMBER(1,0) CHECK (is_active IN (0,1)),
                           created_at TIMESTAMP(6),
                           updated_at TIMESTAMP(6)
);

-- -------------------------------
-- TABLE: flight
-- -------------------------------
CREATE TABLE flight (
                        id NUMBER(19,0) PRIMARY KEY,
                        code VARCHAR2(255 CHAR),
                        carrier_code VARCHAR2(10 CHAR),
                        aircraft_code VARCHAR2(20 CHAR),
                        departure_time TIMESTAMP(6),
                        arrival_time TIMESTAMP(6),
                        duration VARCHAR2(50 CHAR),
                        price FLOAT(53),
                        airline_id NUMBER(19,0) NOT NULL,
                        route_id NUMBER(19,0) NOT NULL,
                        staff_id NUMBER(19,0) NOT NULL,
                        created_at TIMESTAMP(6),
                        updated_at TIMESTAMP(6)
);

-- -------------------------------
-- TABLE: invoice
-- -------------------------------
CREATE TABLE invoice (
                         id NUMBER(19,0) PRIMARY KEY,
                         invoice_code VARCHAR2(255 CHAR) NOT NULL UNIQUE,
                         total_amount FLOAT(53) NOT NULL,
                         discount_amount FLOAT(53),
                         currency VARCHAR2(255 CHAR) NOT NULL,
                         status VARCHAR2(255 CHAR),
                         customer_id NUMBER(19,0),
                         promotion_id NUMBER(19,0),
                         issued_at TIMESTAMP(6),
                         created_at TIMESTAMP(6),
                         updated_at TIMESTAMP(6)
);

-- -------------------------------
-- TABLE: payment
-- -------------------------------
CREATE TABLE payment (
                         id NUMBER(19,0) PRIMARY KEY,
                         amount FLOAT(53) NOT NULL,
                         currency VARCHAR2(255 CHAR) NOT NULL,
                         method VARCHAR2(255 CHAR) NOT NULL,
                         status VARCHAR2(255 CHAR) NOT NULL,
                         payment_code VARCHAR2(255 CHAR) NOT NULL UNIQUE,
                         transaction_id VARCHAR2(255 CHAR),
                         payment_date TIMESTAMP(6),
                         invoice_id NUMBER(19,0),
                         created_at TIMESTAMP(6),
                         updated_at TIMESTAMP(6)
);

-- -------------------------------
-- TABLE: passengers
-- -------------------------------
CREATE TABLE passengers (
                            id NUMBER(19,0) PRIMARY KEY,
                            full_name VARCHAR2(255 CHAR) NOT NULL,
                            email VARCHAR2(255 CHAR) NOT NULL,
                            phone_number VARCHAR2(255 CHAR) NOT NULL,
                            nationality VARCHAR2(255 CHAR) NOT NULL,
                            passport_number VARCHAR2(255 CHAR) NOT NULL,
                            dob TIMESTAMP(6),
                            registration_date TIMESTAMP(6),
                            seat VARCHAR2(255 CHAR),
                            seat_price VARCHAR2(255 CHAR),
                            type VARCHAR2(255 CHAR),
                            created_at TIMESTAMP(6),
                            updated_at TIMESTAMP(6)
);

-- -------------------------------
-- TABLE: route_segments
-- -------------------------------
CREATE TABLE route_segments (
                                id NUMBER(19,0) PRIMARY KEY,
                                route_id NUMBER(19,0) NOT NULL,
                                sequence NUMBER(10,0) NOT NULL,
                                from_airport VARCHAR2(255 CHAR) NOT NULL,
                                to_airport VARCHAR2(255 CHAR) NOT NULL,
                                stop_type VARCHAR2(255 CHAR) NOT NULL,
                                flight_duration NUMBER(10,0) NOT NULL,
                                stop_duration NUMBER(10,0),
                                created_at TIMESTAMP(6),
                                updated_at TIMESTAMP(6)
);

-- -------------------------------
-- TABLE: ticket
-- -------------------------------
CREATE TABLE ticket (
                        id NUMBER(19,0) PRIMARY KEY,
                        flight_id NUMBER(19,0) NOT NULL,
                        passenger_id NUMBER(19,0) NOT NULL,
                        invoice_id NUMBER(19,0),
                        price FLOAT(53) NOT NULL,
                        booking_date TIMESTAMP(6) NOT NULL,
                        seat_number VARCHAR2(255 CHAR) NOT NULL,
                        class VARCHAR2(255 CHAR) NOT NULL,
                        created_at TIMESTAMP(6),
                        updated_at TIMESTAMP(6),
                        created_at TIMESTAMP(6),
                        updated_at TIMESTAMP(6)
);


ALTER TABLE flight
    ADD CONSTRAINT FK_flight_airline FOREIGN KEY (airline_id) REFERENCES airlines;

ALTER TABLE flight
    ADD CONSTRAINT FK_flight_route FOREIGN KEY (route_id) REFERENCES routes;

ALTER TABLE flight
    ADD CONSTRAINT FK_flight_staff FOREIGN KEY (staff_id) REFERENCES users;

ALTER TABLE invoice
    ADD CONSTRAINT FK_invoice_customer FOREIGN KEY (customer_id) REFERENCES users;

ALTER TABLE invoice
    ADD CONSTRAINT FK_invoice_promotion FOREIGN KEY (promotion_id) REFERENCES promotion;

ALTER TABLE payment
    ADD CONSTRAINT FK_payment_invoice FOREIGN KEY (invoice_id) REFERENCES invoice;

ALTER TABLE promotion
    ADD CONSTRAINT FK_promotion_airline FOREIGN KEY (airline_id) REFERENCES airlines;

ALTER TABLE promotion
    ADD CONSTRAINT FK_promotion_customer FOREIGN KEY (customer_id) REFERENCES users;

ALTER TABLE promotion
    ADD CONSTRAINT FK_promotion_route FOREIGN KEY (route_id) REFERENCES routes;

ALTER TABLE route_segments
    ADD CONSTRAINT FK_route_segment_route FOREIGN KEY (route_id) REFERENCES routes;

ALTER TABLE ticket
    ADD CONSTRAINT FK_ticket_flight FOREIGN KEY (flight_id) REFERENCES flight;

ALTER TABLE ticket
    ADD CONSTRAINT FK_ticket_invoice FOREIGN KEY (invoice_id) REFERENCES invoice;

ALTER TABLE ticket
    ADD CONSTRAINT FK_ticket_passenger FOREIGN KEY (passenger_id) REFERENCES passengers;

-- ---------------------------
-- USERS
-- ---------------------------
INSERT INTO QUANLYVEMAYBAY.USERS (ID, FULL_NAME, EMAIL, PASSWORD, PHONE_NUMBER, ROLE, DOB, CREATED_AT, UPDATED_AT)
VALUES (QUANLYVEMAYBAY.USERS_SEQ.NEXTVAL, 'Nguyen Van A', 'a.nguyen@example.com', 'password123', '0901234567', 'CUSTOMER', TO_DATE('1990-05-20','YYYY-MM-DD'), SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO QUANLYVEMAYBAY.USERS (ID, FULL_NAME, EMAIL, PASSWORD, PHONE_NUMBER, ROLE, DOB, CREATED_AT, UPDATED_AT)
VALUES (QUANLYVEMAYBAY.USERS_SEQ.NEXTVAL, 'Tran Thi B', 'b.tran@example.com', 'password123', '0907654321', 'CUSTOMER', TO_DATE('1985-11-10','YYYY-MM-DD'), SYSTIMESTAMP, SYSTIMESTAMP);

-- ---------------------------
-- AIRPORTS
-- ---------------------------
INSERT INTO QUANLYVEMAYBAY.AIRPORTS (CODE, NAME, CITY, COUNTRY)
VALUES ('HAN', 'Noi Bai International Airport', 'Hanoi', 'Vietnam');

INSERT INTO QUANLYVEMAYBAY.AIRPORTS (CODE, NAME, CITY, COUNTRY)
VALUES ('SGN', 'Tan Son Nhat International Airport', 'Ho Chi Minh City', 'Vietnam');

-- ---------------------------
-- ROUTES
-- ---------------------------
INSERT INTO QUANLYVEMAYBAY.ROUTES (ID, NAME)
VALUES (QUANLYVEMAYBAY.ROUTE_SEQ.NEXTVAL, 'Hanoi - Ho Chi Minh');

-- ---------------------------
-- ROUTE_SEGMENTS
-- ---------------------------
INSERT INTO QUANLYVEMAYBAY.ROUTE_SEGMENTS (ID, ROUTE_ID, SEQUENCE, FROM_AIRPORT, TO_AIRPORT, STOP_TYPE, FLIGHT_DURATION, STOP_DURATION)
VALUES (QUANLYVEMAYBAY.ROUTE_SEGMENT_SEQ.NEXTVAL, 1, 1, 'HAN', 'SGN', 'DIRECT', 120, 0);

-- ---------------------------
-- AIRLINES
-- ---------------------------
INSERT INTO QUANLYVEMAYBAY.AIRLINES (ID, NAME, CODE, COUNTRY, CAPACITY, MANUFACTURNER, MODEL, ECONOMY_COMMISSION, BUSINESS_COMMISSION, TICKET_ISSUANCE_FEE, CHANGE_FEE, CREATED_AT)
VALUES (QUANLYVEMAYBAY.AIRLINES_SEQ.NEXTVAL, 'Vietnam Airlines', 'VN', 'Vietnam', '200', 'Boeing', '787', 50, 100, 10, 20, SYSTIMESTAMP);

INSERT INTO QUANLYVEMAYBAY.AIRLINES (ID, NAME, CODE, COUNTRY, CAPACITY, MANUFACTURNER, MODEL, ECONOMY_COMMISSION, BUSINESS_COMMISSION, TICKET_ISSUANCE_FEE, CHANGE_FEE, CREATED_AT)
VALUES (QUANLYVEMAYBAY.AIRLINES_SEQ.NEXTVAL, 'VietJet Air', 'VJ', 'Vietnam', '180', 'Airbus', 'A320', 40, 90, 8, 15, SYSTIMESTAMP);

-- ---------------------------
-- PROMOTION
-- ---------------------------
INSERT INTO QUANLYVEMAYBAY.PROMOTION (ID, CODE, DESCRIPTION, DISCOUNT_TYPE, DISCOUNT_VALUE, MAX_DISCOUNT, MIN_FARE, AIRLINE_ID, ROUTE_ID, CUSTOMER_ID, START_DATE, END_DATE, IS_ACTIVE, CREATED_AT, UPDATED_AT)
VALUES (QUANLYVEMAYBAY.PROMOTION_SEQ.NEXTVAL, 'PROMO10', '10% discount for Hanoi-SGN flights', 'PERCENT', 10, 50, 100, 1, 1, NULL, SYSTIMESTAMP, SYSTIMESTAMP + INTERVAL '30' DAY, 1, SYSTIMESTAMP, SYSTIMESTAMP);

INSERT INTO QUANLYVEMAYBAY.PROMOTION (ID, CODE, DESCRIPTION, DISCOUNT_TYPE, DISCOUNT_VALUE, MAX_DISCOUNT, MIN_FARE, AIRLINE_ID, ROUTE_ID, CUSTOMER_ID, START_DATE, END_DATE, IS_ACTIVE, CREATED_AT, UPDATED_AT)
VALUES (QUANLYVEMAYBAY.PROMOTION_SEQ.NEXTVAL, 'VOUCHER5', '5 EUR off for VietJet flights', 'AMOUNT', 5, 5, 2, 2, NULL, NULL, SYSTIMESTAMP, SYSTIMESTAMP + INTERVAL '15' DAY, 1, SYSTIMESTAMP, SYSTIMESTAMP);
