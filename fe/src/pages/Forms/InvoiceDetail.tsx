"use client";
import Swal from "sweetalert2";
import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Button,
  Divider,
  Avatar,
  Typography,
  Alert,
  Spin,
  Result,
  Popover,
  Timeline,
  Form,
  Select,
} from "antd";
import {
  UserOutlined,
  PrinterOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  EuroCircleOutlined,
  SwapOutlined,
  CalendarTwoTone,
  SaveOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import {
  getInvoiceBookingDetail,
  InvoiceBookingData,
  updateBookingTransaction,
} from "../../hooks/invoiceApi";
import { AirlineResDTO, getAirlines } from "../../hooks/airlineApi";
import FlightSearchModal from "../../components/ecommerce/FlightSearchModal";
import SeatPickerModal from "../../components/ecommerce/SeatPickerModal";
import { rawSeatmapData } from "../../hooks/amadeusApi";
import { Option } from "antd/es/mentions";

const { Title, Text } = Typography;

export interface LocalPassenger {
  id?: number;
  idTicket?: number;
  fullName: string;
  type: "adult" | "child" | "infant";
  passportNo: string;
  seat?: string;
  seatPrice?: number;
  priceFlight: number;

  dob?: string;
  email?: string;
  phone?: string;
  country?: string;
  address?: string;
}

interface LocalBooking {
  flight: {
    id: number;
    code: string;
    airline: string;
    airlineId: string;
    from: string;
    to: string;
    departure: string;
    arrival: string;
    carrierCode: string;
    aircraftCode: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    basePrice: number;
  };
  passengers: LocalPassenger[];
  changeFee: number;
  isFlightChanged: boolean;
}

const InvoiceDetailForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoiceId = id ? parseInt(id) : null;

  const [originalBooking, setOriginalBooking] =
    useState<InvoiceBookingData | null>(null);
  const [localBooking, setLocalBooking] = useState<LocalBooking | null>(null);
  const [airline, setAirline] = useState<AirlineResDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [currentPassengerKey, setCurrentPassengerKey] = useState<string | null>(
    null
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "credit_card" | "bank_transfer" | "agency_credit"
  >("credit_card");

  const [formPayMent] = Form.useForm();
  const fetchBooking = async () => {
    if (!invoiceId) {
      setError("ID hóa đơn không hợp lệ");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getInvoiceBookingDetail(invoiceId);
      setOriginalBooking(data);

      const airlineData = await getAirlines(
        data.flight.carrierCode || data.flight.airline
      );
      setAirline(airlineData);

      const totalPassengers =
        data.summary.adultCount +
        data.summary.childCount * 0.75 +
        data.summary.infantCount * 0.1;
      const basePrice = data.summary.baseAmount / totalPassengers;

      const local: LocalBooking = {
        flight: {
          id: data.flight.id,
          code: data.flight.code,
          airline: data.flight.airline,
          airlineId: data.flight.carrierCode || data.flight.airline,
          from: data.flight.from,
          to: data.flight.to,
          departureTime: data.flight.departureTime,
          arrivalTime: data.flight.arrivalTime,
          duration: data.flight.duration || "2h",
          basePrice,
        },
        passengers: data.passengers.map((p) => ({
          fullName: p.fullName,
          type: p.type,
          passportNo: p.passportNo,
          seat: p.seat,
          seatPrice: p.seatPrice || 0,
          priceFlight: p.priceFlight,
          dob: p.dob,
          email: p.email,
          phone: p.phone,
          country: p.country,
          address: p.address,
        })),
        changeFee: airlineData.changeFee,
        isFlightChanged: false,
      };
      setLocalBooking(local);
      setHasChanges(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [invoiceId]);

  const calculated = useMemo(() => {
    if (!localBooking || !airline || !originalBooking) return null;

    const passengers = localBooking.passengers;

    const basePricePerAdult = localBooking.flight.basePrice;
    const basePricePerChild = basePricePerAdult * 0.75;
    const basePricePerInfant = basePricePerAdult * 0.1;

    const newBaseAmount =
      passengers.filter((p) => p.type === "adult").length * basePricePerAdult +
      passengers.filter((p) => p.type === "child").length * basePricePerChild +
      passengers.filter((p) => p.type === "infant").length * basePricePerInfant;

    let seatDiff = 0;
    if (!localBooking.isFlightChanged) {
      passengers.forEach((p, i) => {
        const newSeatPrice = p.seatPrice || 0;
        seatDiff += newSeatPrice;
      });
    } else {
      seatDiff = passengers.reduce((sum, p) => sum + (p.seatPrice || 0), 0);
    }

    const changeFeeTotal = localBooking.isFlightChanged
      ? airline.changeFee * passengers.length
      : 0;

    const newTotal = newBaseAmount + seatDiff + changeFeeTotal;

    const oldTotal =
      originalBooking.summary.totalAmount + originalBooking.summary.discount;
    const oldDiscountTotal = originalBooking.summary?.discount || 0;
    const remainingPayment = Math.max(0, newTotal - oldTotal);
    const isReduced = newTotal < oldTotal;

    return {
      baseAmount: newBaseAmount,
      seatDiff: Math.max(0, seatDiff),
      changeFeeTotal,
      newTotal,
      oldTotal,
      remainingPayment,
      isReduced,
      seatDiffRaw: seatDiff,
      oldDiscountTotal,
    };
  }, [localBooking, airline, originalBooking]);

  useEffect(() => {
    if (originalBooking && localBooking) {
      const flightChanged =
        originalBooking.flight.id !== localBooking.flight.id;
      const seatsChanged = originalBooking.passengers.some((p, i) => {
        const newSeat = localBooking.passengers[i];
        return (
          p.seat !== newSeat.seat &&
          (p.seatPrice || 0) !== (newSeat.seatPrice || 0)
        );
      });
      setHasChanges(flightChanged || seatsChanged);
    }
  }, [originalBooking, localBooking]);

  const handleSelectNewFlight = (flight: any) => {
    console.log(flight);

    const fee =
      (airline?.changeFee || 0) * (localBooking?.passengers.length || 0);
    const content = `
    <div style="text-align:left">
      <p>Đổi từ: <strong>${localBooking?.flight.code}</strong></p>
      <p>Thành: <strong>${flight.flight_code}</strong></p>
      <p style="color:red;font-weight:bold">
        Phí đổi: ${airline?.changeFee} EUR × ${localBooking?.passengers.length} số lượng vé = ${fee} EUR
      </p>
    </div>
  `;

    Swal.fire({
      title: "Xác nhận đổi chuyến bay",
      html: content,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1677ff",
      cancelButtonColor: "#d33",
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        setLocalBooking((prev) =>
          prev
            ? {
                ...prev,
                flight: {
                  id: flight.id,
                  code: flight.flight_code,
                  airline: flight.airline || flight.airline_name,
                  airlineId: flight.carrierCode || flight.airline,
                  from: flight.from_airport,
                  to: flight.to_airport,
                  departureTime:
                    flight.itineraries?.[0]?.segments?.[0]?.departure?.at ||
                    flight.departure_time,
                  arrivalTime:
                    flight.itineraries?.[0]?.segments?.[0]?.arrival?.at ||
                    flight.arrival_time,
                  duration: flight.duration,
                  basePrice: parseFloat(flight.total_price),
                  departure:
                    flight.itineraries?.[0]?.segments?.[0]?.departure?.at ||
                    flight.departure_time,
                  arrival:
                    flight.itineraries?.[0]?.segments?.[0]?.arrival?.at ||
                    flight.arrival_time,
                  carrierCode: flight.airline,
                  aircraftCode: flight.aircraft,
                },
                passengers: prev.passengers.map((p) => ({
                  ...p,
                  seat: undefined,
                  seatPrice: 0,
                })),
                isFlightChanged: true,
              }
            : null
        );
        setIsFlightModalOpen(false);
        Swal.fire({
          icon: "success",
          title: "✈️ Chuyến bay đã được thay đổi!",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };

  const assignSeatLocally = (seatId: string, seatPrice: string) => {
    if (!currentPassengerKey || !localBooking) return;
    const price = parseFloat(seatPrice) || 0;
    setLocalBooking((prev) =>
      prev
        ? {
            ...prev,
            passengers: prev.passengers.map((p) =>
              p.passportNo === currentPassengerKey
                ? { ...p, seat: seatId, seatPrice: price }
                : p
            ),
          }
        : null
    );
    setIsSeatModalOpen(false);
    setCurrentPassengerKey(null);
    Swal.fire({
      icon: "success",
      title: `Ghế ${seatId} đã chọn`,
      text: `+${price} EUR`,
      showConfirmButton: false,
      timer: 1500,
    });
  };

  const getAssignedSeats = (): Map<string, string> => {
    const map = new Map<string, string>();
    localBooking?.passengers.forEach((p) => {
      if (p.seat && p.passportNo !== currentPassengerKey) {
        map.set(p.seat, p.fullName);
      }
    });
    return map;
  };

  const autoAssignSeats = () => {
    if (!localBooking) return;

    const passengers = [...localBooking.passengers];
    const assignedSeats = new Set(
      passengers.map((p) => p.seat).filter(Boolean)
    );
    const autoAssignedSeats: string[] = [];
    let seatIndex = 0;

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (p.seat) continue;

      let found = false;
      while (seatIndex < seatmapData.cabin.rows.length && !found) {
        const row = seatmapData.cabin.rows[seatIndex];
        for (const seat of row.seats) {
          if (seat.available && !assignedSeats.has(seat.number)) {
            p.seat = seat.number;
            p.seatPrice = "0 EUR";
            assignedSeats.add(seat.number);
            autoAssignedSeats.push(seat.number);
            found = true;
            break;
          }
        }
        if (!found) seatIndex++;
      }
    }

    setLocalBooking((prev) => (prev ? { ...prev, passengers } : prev));
  };

  const handleSaveChanges = async () => {
    if (!invoiceId || !originalBooking || !localBooking || !calculated) {
      return Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không có đủ dữ liệu để lưu hóa đơn!",
        confirmButtonText: "OK",
      });
    }

    if (!hasChanges) {
      return Swal.fire({
        icon: "info",
        title: "Thông báo",
        text: "Không có thay đổi nào cần lưu.",
        confirmButtonText: "OK",
      });
    }

    const needExtraPayment = calculated.remainingPayment > 0;

    const paymentMethodValue =
      formPayMent.getFieldValue("paymentMethod") || paymentMethod;

    Swal.fire({
      title: "Xác nhận cập nhật hóa đơn",
      html: `
      <p>Tổng mới: <strong>${calculated.newTotal.toLocaleString()} EUR</strong></p>
      ${
        needExtraPayment
          ? `<p style="color:red">Cần thanh toán thêm: <strong>${calculated.remainingPayment.toLocaleString()} EUR</strong></p>`
          : `<p>Không có chênh lệch thanh toán</p>`
      }
      <p>Phương thức thanh toán: <strong>${paymentMethodValue}</strong></p>
    `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      autoAssignSeats();
      try {
        const request = {
          customerId: originalBooking?.customerId || null,
          flight: {
            id: localBooking.flight.id,
            code: localBooking.flight.code,
            airline: localBooking.flight.airline,
            from: localBooking.flight.from,
            to: localBooking.flight.to,
            departure: localBooking.flight.departure,
            arrival: localBooking.flight.arrival,
            departureTime: localBooking.flight.departureTime,
            arrivalTime: localBooking.flight.arrivalTime,
            duration: localBooking.flight.duration,
            basePrice: localBooking.flight.basePrice,
            carrierCode: localBooking.flight.carrierCode,
            aircraftCode: localBooking.flight.aircraftCode,
          },
          passengers: localBooking.passengers.map((p) => ({
            fullName: p.fullName,
            type: p.type,
            passportNo: p.passportNo,
            seat: p.seat,
            seatPrice: p.seatPrice,
            priceFlight: p.priceFlight,
            dob: p.dob,
            email: p.email,
            phone: p.phone,
            country: p.country,
            address: p.address,
          })),
          summary: {
            totalAmount: calculated.newTotal,
            currency: "EUR",
          },

          paymentMethod: paymentMethodValue,
          transactionId: needExtraPayment ? "" : null,
          status: needExtraPayment ? "PENDING" : "COMPLETED",
        };
        console.log(request);

        await updateBookingTransaction(invoiceId.toString(), request);

        Swal.fire({
          title: "Thành công!",
          text: needExtraPayment
            ? "Hóa đơn đã được cập nhật và thanh toán thêm đã được ghi nhận."
            : "Hóa đơn đã được cập nhật thành công.",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/invoice");
        });
      } catch (err: any) {
        console.error(err);
        Swal.fire({
          title: "Lỗi!",
          text:
            err.response?.data?.message ||
            "Không thể lưu hóa đơn. Vui lòng thử lại.",
          icon: "error",
        });
      }
    });
  };

  const openSeatPicker = (key: number) => {
    setCurrentPassengerKey(key);
    setIsSeatModalOpen(true);
  };
  const generateFullSeatmap = (apiData: any): SeatmapData => {
    const seatLabels = ["A", "B", "C", "D", "E", "F"];
    const apiMap = new Map<string, any>();

    apiData.cabin.rows.forEach((row: any) => {
      apiMap.set(row.number, row.seats);
    });

    const rows: Row[] = [];

    for (let row = 1; row <= 40; row++) {
      const rowStr = row.toString();
      const apiSeats = apiMap.get(rowStr);

      const seats: Seat[] = seatLabels.map((label) => {
        const seatNum = `${row}${label}`;
        const apiSeat = apiSeats?.find((s: any) => s.number === seatNum);

        if (apiSeat) {
          return {
            number: apiSeat.number,
            characteristics: apiSeat.characteristics || [],
            available: apiSeat.available,
            price: apiSeat.price,
          };
        } else {
          const isWindow = label === "A" || label === "F";
          const isAisle = label === "C" || label === "D";
          const basePrice = isWindow ? 30 : isAisle ? 25 : 20;
          return {
            number: seatNum,
            characteristics: isWindow
              ? ["WINDOW"]
              : isAisle
              ? ["AISLE"]
              : ["MIDDLE"],
            available: false,
            price: `${basePrice} EUR`,
          };
        }
      });

      rows.push({ number: rowStr, seats });
    }

    return {
      designatorCode: apiData.designatorCode,
      cabin: { class: apiData.cabin.class, rows },
    };
  };
  const seatmapData = generateFullSeatmap(rawSeatmapData);

  if (loading || !calculated) {
    return (
      <div style={{ padding: 64, textAlign: "center" }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (error || !originalBooking || !localBooking) {
    return (
      <Result
        status="500"
        title="Lỗi"
        subTitle={error}
        extra={<Button onClick={fetchBooking}>Thử lại</Button>}
      />
    );
  }

  const {
    flight,
    passengers,
    summary,
    payment,
    id: invoiceCode,
    createdAt,
    customer,
  } = originalBooking;
  const customerInfo = customer || {
    fullName: "Khách lẻ",
    email: "—",
    phoneNumber: "—",
    dob: "",
  };

  const passengerColumns = [
    {
      title: "Họ tên",
      dataIndex: "fullName",
      render: (t: string) => <strong>{t}</strong>,
    },
    {
      title: "Loại",
      dataIndex: "type",
      render: (t: any) => (
        <Tag
          color={t === "adult" ? "blue" : t === "child" ? "green" : "orange"}
        >
          {t === "adult" ? "NL" : t === "child" ? "TE" : "EB"}
        </Tag>
      ),
    },
    { title: "Hộ chiếu", dataIndex: "passportNo" },
    {
      title: "Ghế",
      render: (_: any, record: any) => {
        const p = localBooking.passengers.find(
          (x) => x.passportNo === record.passportNo
        );
        return (
          <Space>
            {p?.seat ? (
              <Tag color="purple">{p.seat}</Tag>
            ) : (
              <Text type="secondary">Tự động</Text>
            )}
            {p?.seatPrice && p.seatPrice > 0 && (
              <Tag color="orange">+{p.seatPrice} EUR</Tag>
            )}
            <Button
              size="small"
              icon={<SwapOutlined />}
              onClick={() => {
                setCurrentPassengerKey(record.passportNo);
                setIsSeatModalOpen(true);
              }}
            >
              Chọn
            </Button>
          </Space>
        );
      },
    },
    {
      title: "Giá vé",
      render: (_: any, r: any) => (
        <Text strong>
          {localBooking.passengers
            .find((p) => p.passportNo === r.passportNo)
            ?.priceFlight.toLocaleString()}{" "}
          EUR
        </Text>
      ),
    },
  ];

  return (
    <>
      <div style={{ padding: 24, background: "#f9f9f9", minHeight: "100vh" }}>
        <div id="printable">
          <Card
            title={
              <Space>
                <EuroCircleOutlined style={{ color: "#d4380d" }} />
                <Title level={4} style={{ margin: 0, color: "#d4380d" }}>
                  HÓA ĐƠN #{invoiceCode}
                </Title>
                {hasChanges && <Tag color="orange">Chưa lưu</Tag>}
              </Space>
            }
            extra={
              <Space>
                <Button
                  icon={<PrinterOutlined />}
                  onClick={() => window.print()}
                >
                  In
                </Button>
                <Popover content="Đổi chuyến bay">
                  <Button
                    icon={<CalendarTwoTone twoToneColor="#d4380d" />}
                    onClick={() => setIsFlightModalOpen(true)}
                  >
                    Đổi chuyến
                  </Button>
                </Popover>
                {hasChanges && (
                  <Button
                    type="primary"
                    danger
                    icon={<SaveOutlined />}
                    onClick={handleSaveChanges}
                  >
                    Cập nhật
                  </Button>
                )}
                <Button onClick={() => navigate(-1)}>Quay lại</Button>
              </Space>
            }
            style={{ maxWidth: 1200, margin: "0 auto" }}
          >
            <Row gutter={24}>
              <Col span={16}>
                <Card title="Khách hàng đặt vé" style={{ marginBottom: 16 }}>
                  <Space>
                    <Avatar
                      size={48}
                      icon={<UserOutlined />}
                      style={{ background: "#1890ff" }}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {customerInfo.fullName}
                      </div>
                      <Text type="secondary">
                        {customerInfo.phoneNumber} • {customerInfo.email}
                      </Text>
                    </div>
                  </Space>
                </Card>

                <Card title="Danh sách hành khách">
                  <Table
                    dataSource={passengers}
                    columns={passengerColumns}
                    pagination={false}
                    rowKey="passportNo"
                  />
                </Card>
              </Col>

              <Col span={8}>
                <Card title="Thông tin chuyến bay" style={{ marginBottom: 16 }}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Title level={5} style={{ margin: 0, color: "#d4380d" }}>
                        {localBooking.flight.code}
                      </Title>
                      <Tag color="blue">Economy</Tag>
                    </div>
                    <Text strong>
                      {localBooking.flight.from} to {localBooking.flight.to}
                    </Text>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        gap: 8,
                        fontSize: 13,
                      }}
                    >
                      <div style={{ textAlign: "right" }}>
                        <div>
                          <strong>
                            {dayjs(localBooking.flight.departureTime).format(
                              "HH:mm"
                            )}
                          </strong>
                        </div>
                        <Text type="secondary">{localBooking.flight.from}</Text>
                      </div>
                      <Text
                        strong
                        style={{ color: "#d4380d", textAlign: "center" }}
                      >
                        <ClockCircleOutlined /> {localBooking.flight.duration}
                      </Text>
                      <div>
                        <div>
                          <strong>
                            {dayjs(localBooking.flight.arrivalTime).format(
                              "HH:mm"
                            )}
                          </strong>
                        </div>
                        <Text type="secondary">{localBooking.flight.to}</Text>
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: "center",
                        background: "#fafafa",
                        padding: 8,
                        borderRadius: 6,
                      }}
                    >
                      <CalendarOutlined />{" "}
                      {dayjs(localBooking.flight.departureTime).format(
                        "DD/MM/YYYY"
                      )}
                    </div>
                  </Space>
                </Card>

                <Card
                  title={
                    <Space>
                      <DollarOutlined /> Thanh toán
                    </Space>
                  }
                >
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="middle"
                  >
                    {payment.length > 0 ? (
                      <div
                        style={{
                          background: "#f6ffed",
                          padding: 16,
                          borderRadius: 8,
                          border: "1px solid #b7eb8f",
                        }}
                      >
                        <Text strong style={{ color: "#389e0d", fontSize: 16 }}>
                          ĐÃ THANH TOÁN
                        </Text>
                        <Timeline style={{ marginTop: 12 }}>
                          {payment.map((p) => (
                            <Timeline.Item
                              key={p.id}
                              color={
                                p.status === "COMPLETED" ? "green" : "orange"
                              }
                            >
                              <div>
                                <Text strong>
                                  {p.amount.toLocaleString()} {p.currency}
                                </Text>{" "}
                                <Tag color="blue">{p.paymentCode}</Tag>
                              </div>
                              <div style={{ fontSize: 13 }}>
                                <Text>
                                  {p.method === "credit_card"
                                    ? "Thẻ"
                                    : p.method === "bank_transfer"
                                    ? "Chuyển khoản"
                                    : "Tín dụng"}
                                </Text>{" "}
                                {p.transactionId && `• ${p.transactionId}`}
                              </div>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {dayjs(p.paymentDate).format("DD/MM HH:mm")}
                              </Text>
                            </Timeline.Item>
                          ))}
                        </Timeline>
                        <div style={{ textAlign: "right", marginTop: 12 }}>
                          <Text
                            strong
                            style={{ fontSize: 16, color: "#389e0d" }}
                          >
                            Tổng đã thanh toán:{" "}
                            {payment
                              .reduce((sum, p) => sum + p.amount, 0)
                              .toLocaleString()}{" "}
                            EUR
                          </Text>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          background: "#fff2f0",
                          padding: 16,
                          borderRadius: 8,
                          border: "1px solid #ffccc7",
                        }}
                      >
                        <Text strong style={{ color: "#cf1322", fontSize: 16 }}>
                          CHƯA THANH TOÁN
                        </Text>
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary">
                            Chưa có giao dịch thanh toán nào
                          </Text>
                        </div>
                      </div>
                    )}

                    {hasChanges && (
                      <div
                        style={{
                          background: "#fff7e6",
                          padding: 16,
                          borderRadius: 8,
                          border: "1px solid #ffd591",
                        }}
                      >
                        <Text strong style={{ color: "#d4380d", fontSize: 16 }}>
                          SAU KHI THAY ĐỔI
                        </Text>
                        <div style={{ marginTop: 12, fontSize: 14 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text>Vé cơ bản</Text>
                            <Text strong>
                              {calculated.baseAmount.toLocaleString()} EUR
                            </Text>
                          </div>

                          {calculated.seatDiff !== 0 && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Text>{"Phụ thu ghế (mới)"}</Text>
                              <Text strong type="danger">
                                {calculated.seatDiff.toLocaleString()} EUR
                              </Text>
                            </div>
                          )}
                          {calculated.seatDiffRaw < 0 &&
                            !localBooking.isFlightChanged && (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Text>Giảm giá ghế</Text>
                                <Text strong type="secondary">
                                  -
                                  {Math.abs(
                                    calculated.seatDiffRaw
                                  ).toLocaleString()}{" "}
                                  EUR
                                </Text>
                              </div>
                            )}

                          {localBooking.isFlightChanged && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Text type="danger">Phí đổi vé</Text>
                              <Text strong type="danger">
                                +{calculated.changeFeeTotal.toLocaleString()}{" "}
                                EUR
                              </Text>
                            </div>
                          )}

                          <Divider style={{ margin: "8px 0" }} />
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text strong>TỔNG MỚI</Text>
                            <Text
                              strong
                              style={{ fontSize: 18, color: "#d4380d" }}
                            >
                              {calculated.newTotal.toLocaleString()} EUR
                            </Text>
                          </div>
                        </div>

                        {calculated.remainingPayment > 0 && (
                          <Form
                            form={formPayMent}
                            layout="vertical"
                            style={{ marginTop: 16 }}
                          >
                            <Form.Item
                              label={<strong>Phương thức thanh toán</strong>}
                              name="paymentMethod"
                              rules={[
                                {
                                  required: true,
                                  message: "Chọn phương thức thanh toán",
                                },
                              ]}
                            >
                              <Select
                                size="large"
                                placeholder="Chọn phương thức thanh toán"
                              >
                                <Option value="agency_credit">
                                  <strong>Tín dụng đại lý</strong>
                                </Option>
                                <Option value="bank_transfer">
                                  Chuyển khoản ngân hàng
                                </Option>
                                <Option value="credit_card">
                                  Thẻ tín dụng / Ghi nợ
                                </Option>
                              </Select>
                            </Form.Item>
                          </Form>
                        )}
                      </div>
                    )}
                    {hasChanges && calculated.remainingPayment > 0 && (
                      <Alert
                        type="error"
                        showIcon
                        message={
                          <Text strong type="danger">
                            Cần thanh toán thêm:{" "}
                            {calculated.remainingPayment.toLocaleString()} EUR
                          </Text>
                        }
                        style={{ marginTop: 16 }}
                      />
                    )}
                    {hasChanges && calculated.isReduced && (
                      <Alert
                        type="info"
                        showIcon
                        message={
                          <Text type="secondary">
                            Không hoàn tiền (giảm{" "}
                            {Math.abs(
                              calculated.remainingPayment
                            ).toLocaleString()}{" "}
                            EUR)
                          </Text>
                        }
                        style={{ marginTop: 16 }}
                      />
                    )}

                    {!hasChanges && (
                      <div
                        style={{
                          background: "#fafafa",
                          border: "1px solid #f0f0f0",
                          borderRadius: 8,
                          padding: 16,
                          margin: "16px 0",
                        }}
                      >
                        <Text
                          strong
                          style={{
                            fontSize: 16,
                            color: "#1d39c4",
                            display: "block",
                            marginBottom: 12,
                          }}
                        >
                          Thông tin thanh toán cũ
                        </Text>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <Text type="secondary">Giá vé gốc:</Text>
                          <Text strong>
                            {originalBooking.summary.totalAmount} EUR
                          </Text>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <Text type="secondary">Giảm giá:</Text>
                          <Text strong style={{ color: "#d4380d" }}>
                            -{originalBooking.summary.discount} EUR
                          </Text>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            paddingTop: 12,
                            borderTop: "1px dashed #d9d9d9",
                            marginTop: 8,
                          }}
                        >
                          <Text strong style={{ fontSize: 18 }}>
                            Tổng tiền:
                          </Text>
                          <Text
                            strong
                            style={{ fontSize: 18, color: "#389e0d" }}
                          >
                            {originalBooking.summary.totalAmount +
                              originalBooking.summary.discount}{" "}
                            EUR
                          </Text>
                        </div>

                        <div style={{ textAlign: "center", marginTop: 12 }}>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Chưa có thay đổi nào
                          </Text>
                        </div>
                      </div>
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>
        </div>
      </div>

      <FlightSearchModal
        isSearchModalOpen={isFlightModalOpen}
        setIsSearchModalOpen={setIsFlightModalOpen}
        handleSelectFlight={handleSelectNewFlight}
        fromAirport={localBooking.flight.from}
        toAirport={localBooking.flight.to}
        isDetail={false}
        airlineCodes={[flight.carrierCode]}
      />
      <SeatPickerModal
        visible={isSeatModalOpen}
        onClose={() => {
          setIsSeatModalOpen(false);
          setCurrentPassengerKey(null);
        }}
        onSelect={assignSeatLocally}
        assignedSeats={getAssignedSeats()}
        seatmapData={seatmapData}
      />
    </>
  );
};

export default InvoiceDetailForm;
