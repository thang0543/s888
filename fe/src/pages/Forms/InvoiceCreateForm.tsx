import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Table,
  Modal,
  Card,
  message,
  Space,
  Statistic,
  Row,
  Col,
  Tag,
  Alert,
  Divider,
  Avatar,
} from "antd";
import { CloseOutlined, UserAddOutlined } from "@ant-design/icons";
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import FlightSearchModal from "../../components/ecommerce/FlightSearchModal";
import SeatPickerModal from "../../components/ecommerce/SeatPickerModal";
import { UserOutlined, SwapOutlined } from "@ant-design/icons";
import { rawSeatmapData } from "../../hooks/amadeusApi";
import { createUser, getUsers } from "../../hooks/userApi";
import {
  BookingPaymentRequestDTO,
  createBookingTransaction,
} from "../../hooks/invoiceApi";
import { useNavigate } from "react-router";
import { DiscountCode, getPromotions } from "../../hooks/promotionApi";
import Swal from "sweetalert2";
const { Option } = Select;

type PassengerType = "adult" | "child" | "infant";
interface Passenger {
  key: number;
  full_name: string;
  type: PassengerType;
  passport_no: string;
  dob: string;
  country: string;
  phone: string;
  email: string;
  address: string;
  seat?: string;
  seatPrice?: string;
}
const mockFlights = [
  {
    id: 1,
    flight_code: "VN123",
    airline: { name: "Vietnam Airlines" },
    route: { from_airport: "SGN", to_airport: "HAN" },
    departure_time: "2025-11-05T07:00:00",
    arrival_time: "2025-11-05T09:00:00",
    total_price: 2500000,
    seats_available: 50,
  },
];

const InvoiceCreateForm: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [passengers, setPassengers] = useState<Passenger[]>([
    {
      key: 1,
      full_name: "",
      type: "adult",
      passport_no: "",
      dob: "",
      country: "",
      phone: "",
      email: "",
      address: "",
      seat: undefined,
      seatPrice: "",
    },
  ]);
  const [promotions, setPromotions] = useState<DiscountCode[]>([]);
  const [selectedPromotion, setSelectedPromotion] =
    useState<DiscountCode | null>(null);
  const [formData] = Form.useForm();
  const [formPayMent] = Form.useForm();
  const handleSearchFlights = (values: any) => {
    setTimeout(() => {
      setSearchResults(mockFlights);
    }, 500);
  };

  useEffect(() => {
    getPromotions()
      .then((res) => setPromotions(res))
      .catch((err) => console.error("Lấy promotions thất bại:", err));
  }, []);

  const handleSelectFlight = (flight: any) => {
    setSelectedFlight(flight);
    setIsSearchModalOpen(false);
    Swal.fire({
      icon: "success",
      title: `Đã chọn: ${flight.flight_code}`,
      showConfirmButton: false,
      timer: 1500,
    });
  };

  const addPassenger = () => {
    const newKey = Date.now();
    setPassengers([
      ...passengers,
      {
        key: newKey,
        full_name: "",
        type: "adult",
        passport_no: "",
        dob: "",
        country: "",
        phone: "",
        email: "",
        address: "",
        seat: undefined,
        seatPrice: "",
      },
    ]);
  };

  const removePassenger = (key: number) => {
    if (passengers.length === 1) return;
    setPassengers(passengers.filter((p) => p.key !== key));
  };

  const updatePassenger = (key: number, field: keyof Passenger, value: any) => {
    setPassengers(
      passengers.map((p) => (p.key === key ? { ...p, [field]: value } : p))
    );
  };

  const adultCount = passengers.filter((p) => p.type === "adult").length;
  const childCount = passengers.filter((p) => p.type === "child").length;
  const infantCount = passengers.filter((p) => p.type === "infant").length;

  const seatTotal = passengers.reduce((sum, p) => {
    console.log(p);

    const price = p.seatPrice ? Number(p.seatPrice) : 0;
    return sum + price;
  }, 0);
  const navigate = useNavigate();
  const handleSave = async (status: string) => {
    if (status !== "TEMP" && !selectedFlight)
      return Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Chưa chọn chuyến bay",
        confirmButtonText: "OK",
      });
    if (
      status !== "TEMP" &&
      passengers.some((p) => !p.full_name || !p.passport_no)
    ) {
      return Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Nhập đầy đủ hành khách",
        confirmButtonText: "OK",
      });
    }

    const assignedSeats = new Set(
      passengers.map((p) => p.seat).filter(Boolean)
    );
    const updatedPassengers = [...passengers];
    const autoAssignedSeats: string[] = [];
    let seatIndex = 0;

    for (let i = 0; i < updatedPassengers.length; i++) {
      const p = updatedPassengers[i];
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

    setPassengers(updatedPassengers);

    const method =
      status === "TEMP"
        ? { paymentMethod: "" }
        : await formPayMent.validateFields();

    const request: BookingPaymentRequestDTO = {
      customerId: bookingCustomer ? bookingCustomer.id : 0,
      flight: {
        id: selectedFlight.id,
        code: selectedFlight.flight_code,
        airline: selectedFlight.airline,
        from: selectedFlight.from_airport,
        to: selectedFlight.to_airport,
        departure:
          selectedFlight.itineraries?.[0]?.segments?.[0]?.departure?.at ||
          selectedFlight.departure_time,
        arrival:
          selectedFlight.itineraries?.[0]?.segments?.[0]?.arrival?.at ||
          selectedFlight.arrival_time,
        basePrice: parseFloat(selectedFlight.total_price),
        duration: selectedFlight.duration,
        carrierCode: selectedFlight.airline,
        aircraftCode: selectedFlight.aircraft,
        departureTime:
          selectedFlight.itineraries?.[0]?.segments?.[0]?.departure?.at ||
          selectedFlight.departure_time,
        arrivalTime:
          selectedFlight.itineraries?.[0]?.segments?.[0]?.arrival?.at ||
          selectedFlight.arrival_time,
      },
      passengers: updatedPassengers.map((p) => ({
        fullName: p.full_name || "temp",
        type: p.type || "",
        passportNo: p.passport_no || "temp",
        seat: p.seat || "",
        seatPrice: p.seatPrice ? parseFloat(p.seatPrice) : 0,
        email: p.email || "temp",
        phone: p.phone || "temp",
        dob: p.dob || "",
        country: p.country || "temp",
        address: p.address || "temp",
        priceFlight:
          p.type === "adult"
            ? parseFloat(selectedFlight.total_price)
            : p.type === "child"
            ? parseFloat(selectedFlight.total_price) * 0.75
            : p.type === "infant"
            ? parseFloat(selectedFlight.total_price) * 0.1
            : 0,
      })),
      summary: {
        adultCount,
        childCount,
        infantCount,
        baseAmount,
        seatTotal,
        totalAmount: discountedTotal,
        discountAmount: discountAmount,
        currency: "EUR",
        autoAssignedSeats,
        autoAssignedCount: autoAssignedSeats.length,
      },
      paymentMethod: method.paymentMethod,
      promotionId: selectedPromotion?.id || 0,
      transactionId: "",
      status: status,
    };

    try {
      const result = await createBookingTransaction(request);
      Swal.fire({
        icon: "success",
        title:
          status === "templ"
            ? "Đã lưu tạm thông tin đặt vé!"
            : `Đặt vé thành công! ID: ${result.id}`,
        showConfirmButton: false,
        timer: 1500,
      });
      console.log("Booking result:", result);
      if (status !== "templ") {
        setTimeout(() => navigate("/invoice"), 1000);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: "Lưu / đặt vé thất bại!",
        confirmButtonText: "OK",
      });
    }
  };

  const [bookingCustomer, setBookingCustomer] = useState<any>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const passengerColumns = [
    {
      title: "Họ tên",
      width: 150,
      render: (_: any, record: Passenger) => (
        <Input
          value={record.full_name}
          onChange={(e) =>
            updatePassenger(record.key, "full_name", e.target.value)
          }
          placeholder="Nguyễn Văn A"
          prefix={<UserOutlined />}
        />
      ),
    },
    {
      title: "Loại",
      width: 100,
      render: (_: any, record: Passenger) => (
        <Select
          value={record.type}
          onChange={(v) => updatePassenger(record.key, "type", v)}
          style={{ width: "100%" }}
        >
          <Option value="adult">Người lớn</Option>
          <Option value="child">Trẻ em</Option>
          <Option value="infant">Em bé</Option>
        </Select>
      ),
    },
    {
      title: "Hộ chiếu",
      width: 130,
      render: (_: any, record: Passenger) => (
        <Input
          value={record.passport_no}
          onChange={(e) =>
            updatePassenger(record.key, "passport_no", e.target.value)
          }
          placeholder="C1234567"
        />
      ),
    },
    {
      title: "Ngày sinh",
      width: 130,
      render: (_: any, record: Passenger) => (
        <DatePicker
          value={record.dob ? dayjs(record.dob, "DD/MM/YYYY") : undefined}
          onChange={(_, dateString) => {
            const selected = dayjs(dateString, "DD/MM/YYYY");
            const today = dayjs().startOf("day");

            if (selected.isAfter(today)) {
              Swal.fire({
                icon: "warning",
                title: "Cảnh báo",
                text: "Ngày sinh không được là ngày hôm nay hoặc tương lai!",
                confirmButtonText: "OK",
              });
              return;
            }

            updatePassenger(record.key, "dob", dateString);
          }}
          style={{ width: "100%" }}
          format="DD/MM/YYYY"
          placeholder="Chọn ngày"
          disabledDate={(current) => {
            return current && current >= dayjs().startOf("day");
          }}
          allowClear
        />
      ),
    },
    {
      title: "Quốc gia",
      width: 120,
      render: (_: any, record: Passenger) => (
        <Input
          value={record.country}
          onChange={(e) =>
            updatePassenger(record.key, "country", e.target.value)
          }
          placeholder="Vietnam"
        />
      ),
    },
    {
      title: "Số ĐT",
      width: 130,
      render: (_: any, record: Passenger) => (
        <Input
          value={record.phone}
          onChange={(e) => updatePassenger(record.key, "phone", e.target.value)}
          placeholder="0901234567"
        />
      ),
    },
    {
      title: "Email",
      width: 160,
      render: (_: any, record: Passenger) => (
        <Input
          value={record.email}
          onChange={(e) => updatePassenger(record.key, "email", e.target.value)}
          placeholder="abc@gmail.com"
        />
      ),
    },
    {
      title: "Nơi ở",
      width: 160,
      render: (_: any, record: Passenger) => (
        <Input
          value={record.address}
          onChange={(e) =>
            updatePassenger(record.key, "address", e.target.value)
          }
          placeholder="Hà Nội"
        />
      ),
    },
    {
      title: "Ghế",
      width: 100,
      render: (_: any, record: Passenger) => (
        <Button
          type={record.seat ? "primary" : "default"}
          icon={<SwapOutlined />}
          size="small"
          onClick={() => openSeatPicker(record.key)}
          style={{ width: "100%" }}
          danger={record.seat ? true : false}
        >
          {record.seat || "Chọn"}
        </Button>
      ),
    },
    {
      title: "",
      width: 50,
      render: (_: any, record: Passenger) =>
        passengers.length > 1 ? (
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => removePassenger(record.key)}
          />
        ) : null,
    },
  ];
  const [currentPassengerKey, setCurrentPassengerKey] = useState<number | null>(
    null
  );

  const getAssignedSeats = (): Map<string, string> => {
    const map = new Map<string, string>();
    passengers.forEach((p) => {
      if (p.seat && p.key !== currentPassengerKey) {
        map.set(p.seat, p.full_name || `Hành khách ${p.key}`);
      }
    });
    return map;
  };

  const openSeatPicker = (key: number) => {
    if (!selectedFlight) {
      Swal.fire({
        icon: "warning",
        title: "Cảnh báo",
        text: "Vui lòng chọn chuyến bay trước!",
        confirmButtonText: "OK",
      });
      return;
    }
    setCurrentPassengerKey(key);
    setIsSeatModalOpen(true);
  };

  const assignSeat = (seatId: string, seatPrice: string) => {
    if (currentPassengerKey === null) return;
    const updated = passengers.map((p) =>
      p.key === currentPassengerKey
        ? { ...p, seat: seatId, seatPrice: seatPrice }
        : p
    );
    setPassengers(updated);
    setIsSeatModalOpen(false);
    setCurrentPassengerKey(null);
    Swal.fire({
      icon: "success",
      title: `Đã chọn ghế ${seatId}`,
      showConfirmButton: false,
      timer: 1500,
    });
  };

  interface Seat {
    number: string;
    characteristics: string[];
    available: boolean;
    price: string;
  }

  interface Row {
    number: string;
    seats: Seat[];
  }

  interface SeatmapData {
    designatorCode: string;
    cabin: {
      class: string;
      rows: Row[];
    };
  }
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

  const totalAmount = useMemo(() => {
    const base = selectedFlight?.total_price
      ? parseFloat(selectedFlight.total_price)
      : 0;

    const safeAdult = Number.isFinite(adultCount) ? adultCount : 0;
    const safeChild = Number.isFinite(childCount) ? childCount : 0;
    const safeInfant = Number.isFinite(infantCount) ? infantCount : 0;
    const safeSeat = Number.isFinite(seatTotal) ? seatTotal : 0;

    if (!selectedFlight) return safeSeat;

    return (
      base * safeAdult +
      base * 0.75 * safeChild +
      base * 0.1 * safeInfant +
      safeSeat
    );
  }, [selectedFlight, adultCount, childCount, infantCount, seatTotal]);

  const baseAmount = useMemo(() => {
    if (!selectedFlight) return seatTotal;
    const base = selectedFlight ? parseFloat(selectedFlight.total_price) : 0;
    return (
      base * adultCount + base * 0.75 * childCount + base * 0.1 * infantCount
    );
  }, [selectedFlight, adultCount, childCount, infantCount]);

  const [customers, setCustomers] = useState<User[]>([]);

  useEffect(() => {
    getUsers()
      .then(setCustomers)
      .catch((err) => console.error(err));
  }, []);

  const validPromotions = useMemo(() => {
    if (!selectedFlight) return [];

    return promotions.filter((p) => {
      const now = dayjs();
      if (!p.isActive) return false;
      if (dayjs(p.startDate).isAfter(now) || dayjs(p.endDate).isBefore(now))
        return false;
      if (p.airlineName !== selectedFlight.airline) return false;

      if (p.nameRouter && p.nameRouter !== selectedFlight.route) return false;

      if (p.minFare && baseAmount < p.minFare) return false;

      if (p.code.includes("VIPCUSTOMER") && bookingCustomer) {
        const id = parseInt(p.code.replace("VIPCUSTOMER", ""), 10);
        if (bookingCustomer.id !== id) return false;
      }

      return true;
    });
  }, [promotions, selectedFlight, baseAmount, bookingCustomer]);

  const discountedTotal = useMemo(() => {
    if (!selectedPromotion) return totalAmount;

    let discount = 0;
    if (selectedPromotion.discountType === "PERCENT") {
      discount = (baseAmount * selectedPromotion.discountValue) / 100;
      if (selectedPromotion.maxDiscount)
        discount = Math.min(discount, selectedPromotion.maxDiscount);
    } else if (selectedPromotion.discountType === "AMOUNT") {
      discount = selectedPromotion.discountValue;
    }

    return Math.max(totalAmount - discount, 0);
  }, [selectedPromotion, baseAmount, totalAmount]);
  const discountAmount = useMemo(() => {
    if (!selectedPromotion) return 0;

    let discount = 0;

    if (selectedPromotion.discountType === "PERCENT") {
      discount = (baseAmount * selectedPromotion.discountValue) / 100;
      if (selectedPromotion.maxDiscount)
        discount = Math.min(discount, selectedPromotion.maxDiscount);
    } else if (selectedPromotion.discountType === "AMOUNT") {
      discount = selectedPromotion.discountValue;
    }

    return Math.min(discount, totalAmount);
  }, [selectedPromotion, baseAmount, totalAmount]);
  return (
    <div style={{ padding: 24, background: "#f9f9f9", minHeight: "100vh" }}>
      <Card
        title="Tạo Hóa Đơn Bán Vé"
        extra={<Button onClick={() => window.history.back()}>Quay lại</Button>}
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Row gutter={24}>
          <Col span={16}>
            <Card
              title={
                <span style={{ color: "#d4380d" }}>thông tin khách hàng</span>
              }
              style={{ height: "100%", minHeight: 500 }}
              bodyStyle={{ padding: 0 }}
            >
              <div style={{ padding: 16 }}>
                <Space style={{ marginBottom: 16 }}>
                  <Button icon={<PlusOutlined />} onClick={addPassenger}>
                    Thêm hành khách
                  </Button>
                </Space>
                <Table
                  dataSource={passengers}
                  columns={passengerColumns}
                  pagination={false}
                  size="small"
                  scroll={{ y: 380, x: "max-content" }}
                />
              </div>
            </Card>
          </Col>

          <Col span={8}>
            <Card
              title={
                <span style={{ color: "#d4380d" }}>thông tin chuyến bay</span>
              }
              style={{ marginBottom: 16 }}
              extra={
                <Button
                  type="link"
                  icon={<SearchOutlined />}
                  onClick={() => setIsSearchModalOpen(true)}
                  size="small"
                >
                  Tìm chuyến
                </Button>
              }
            >
              {selectedFlight ? (
                <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingBottom: 12,
                      borderBottom: "1px dashed #e8e8e8",
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 18, color: "#d4380d" }}>
                        {selectedFlight.flight_code}
                      </strong>
                      <span
                        style={{ marginLeft: 8, color: "#666", fontSize: 13 }}
                      >
                        {selectedFlight.airline}
                      </span>
                    </div>
                    <Tag color="blue" style={{ fontWeight: "bold" }}>
                      {selectedFlight.cabin_class}
                    </Tag>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: "bold", color: "#262626" }}>
                      {selectedFlight.route}
                    </div>
                    <div style={{ color: "#595959", fontSize: 13 }}>
                      {selectedFlight.full_route}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto 1fr",
                      gap: 8,
                      alignItems: "center",
                      fontSize: 13,
                      color: "#595959",
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "bold", color: "#262626" }}>
                        {selectedFlight.time.split(" - ")[0]}
                      </div>
                      <div>{selectedFlight.from_airport}</div>
                    </div>
                    <div
                      style={{
                        textAlign: "center",
                        color: "#d4380d",
                        fontWeight: "bold",
                      }}
                    >
                      {selectedFlight.duration}
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: "bold", color: "#262626" }}>
                        {selectedFlight.time.split(" - ")[1]}
                      </div>
                      <div>{selectedFlight.to_airport}</div>
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: "center",
                      padding: "8px 0",
                      background: "#fafafa",
                      borderRadius: 6,
                      fontWeight: "bold",
                      color: "#262626",
                      marginBottom: 12,
                    }}
                  >
                    {selectedFlight.date}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      color: "#595959",
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <strong>Hành lý ký gửi:</strong>{" "}
                      {selectedFlight.checked_bag}
                    </div>
                    <div>
                      <strong>Xách tay:</strong> {selectedFlight.cabin_bag}
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: "center",
                      color: "#999",
                      fontSize: 12,
                      marginBottom: 12,
                    }}
                  >
                    Máy bay: <strong>{selectedFlight.aircraft}</strong>
                  </div>

                  <div
                    style={{
                      paddingTop: 12,
                      borderTop: "1px dashed #e8e8e8",
                      textAlign: "right",
                    }}
                  >
                    <div style={{ fontSize: 13, color: "#595959" }}>
                      Giá vé cơ bản: <s>{selectedFlight.base_price}</s>
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#d4380d",
                      }}
                    >
                      Tổng giá vé: {selectedFlight.total_price}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    color: "#999",
                    fontStyle: "italic",
                    padding: "40px 0",
                  }}
                >
                  <SearchOutlined
                    style={{ fontSize: 32, marginBottom: 8, display: "block" }}
                  />
                  Chưa chọn chuyến bay
                </div>
              )}
            </Card>
            <Card
              title={
                <span style={{ color: "#d4380d", fontWeight: "bold" }}>
                  Thanh toán
                </span>
              }
              style={{ marginTop: 16 }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                <div
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px dashed #e8e8e8",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#262626",
                      marginBottom: 8,
                      fontSize: 14,
                    }}
                  >
                    <UserOutlined
                      style={{ marginRight: 6, color: "#d4380d" }}
                    />
                    Khách hàng đặt vé
                  </div>

                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size={4}
                  >
                    <Select
                      showSearch
                      placeholder="Tìm khách hàng (tên, sđt, email)"
                      optionFilterProp="children"
                      value={bookingCustomer?.id ?? undefined}
                      onChange={(value) => {
                        const customer = customers.find((c) => c.id === value);
                        if (customer) {
                          setBookingCustomer(customer);
                          Swal.fire({
                            icon: "success",
                            title: `Đã chọn: ${customer.fullName}`,
                            showConfirmButton: false,
                            timer: 1500,
                          });
                        }
                      }}
                      style={{ width: "100%" }}
                      size="large"
                      dropdownStyle={{ borderRadius: 8 }}
                      optionLabelProp="label"
                      dropdownRender={(menu) => (
                        <>
                          {menu}
                          <Divider style={{ margin: "4px 0" }} />
                          <div style={{ padding: "4px 8px" }}>
                            <Button
                              type="text"
                              icon={<PlusOutlined />}
                              onClick={() => setIsCustomerModalOpen(true)}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                color: "#1890ff",
                                fontWeight: 500,
                                borderRadius: 6,
                                padding: "4px 8px",
                              }}
                              onMouseDown={(e) => e.preventDefault()}
                            >
                              Thêm khách hàng mới
                            </Button>
                          </div>
                        </>
                      )}
                    >
                      {customers.map((c) => (
                        <Option key={c.id} value={c.id} label={c.fullName}>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>
                            {c.fullName}
                          </div>
                        </Option>
                      ))}
                    </Select>

                    {bookingCustomer && (
                      <div
                        style={{
                          padding: "9px 12px",
                          background: "#e6f7ff",
                          border: "1px solid #91d5ff",
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginTop: 4,
                        }}
                      >
                        <Avatar
                          size={32}
                          icon={<UserOutlined />}
                          style={{
                            backgroundColor: "#1890ff",
                            fontSize: 16,
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              color: "#262626",
                              fontSize: 14,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {bookingCustomer.fullName}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#595959",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {bookingCustomer.phoneNumber} •{" "}
                            {bookingCustomer.email}
                          </div>
                        </div>
                        <Button
                          type="text"
                          size="small"
                          icon={<CloseOutlined />}
                          onClick={() => setBookingCustomer(null)}
                          style={{ color: "#999", padding: "0 4px" }}
                        />
                      </div>
                    )}
                  </Space>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px dashed #e8e8e8",
                  }}
                >
                  <span style={{ fontWeight: 500, color: "#595959" }}>
                    Tiền vé cơ bản
                    <Tag color="blue" size="small" style={{ marginLeft: 8 }}>
                      {adultCount} NL + {childCount} TE + {infantCount} EB
                    </Tag>
                  </span>
                  <span style={{ fontWeight: "bold", color: "#262626" }}>
                    {baseAmount.toLocaleString()} EUR
                  </span>
                </div>

                {passengers.some(
                  (p) => p.seat && p.seatPrice && p.seatPrice !== "0 EUR"
                ) && (
                  <div
                    style={{
                      padding: "8px 0",
                      borderBottom: "1px dashed #e8e8e8",
                    }}
                  ></div>
                )}

                <Form.Item label="Mã khuyến mãi" name="promotionId">
                  <Select
                    placeholder="Chọn mã khuyến mãi"
                    onChange={(promoId) => {
                      const promo = promotions.find((p) => p.id === promoId);
                      setSelectedPromotion(promo || null);
                    }}
                    allowClear
                    size="large"
                  >
                    {validPromotions.map((p) => (
                      <Option key={p.id} value={p.id}>
                        {p.code} - {p.description}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "16px",
                    background: "#fff7e6",
                    borderRadius: 8,
                    border: "2px solid #faad14",
                  }}
                >
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#d4380d",
                    }}
                  >
                    TỔNG CỘNG
                  </span>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#d4380d",
                    }}
                  >
                    {discountedTotal.toLocaleString()} EUR
                  </span>
                </div>

                <Form form={formPayMent} layout="vertical">
                  <Form.Item
                    label={<strong>Phương thức thanh toán</strong>}
                    name="paymentMethod"
                    rules={[
                      {
                        required: true,
                        message: "Chọn phương thức thanh toán",
                      },
                    ]}
                    style={{ marginBottom: 0 }}
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
                      <Option value="credit_card">Thẻ tín dụng / Ghi nợ</Option>
                    </Select>
                  </Form.Item>
                </Form>
              </Space>
            </Card>
          </Col>
        </Row>

        <div style={{ textAlign: "right", marginTop: 24 }}>
          <Space>
            <Button
              size="large"
              style={{ minWidth: 140, fontWeight: "bold" }}
              onClick={() => handleSave("TEMP")}
            >
              💾 Lưu tạm thời
            </Button>
            <Button
              type="primary"
              danger
              size="large"
              style={{ minWidth: 140, fontWeight: "bold" }}
              onClick={() => handleSave("PAIN")}
            >
              ✅ Lưu chính thức
            </Button>
          </Space>
        </div>
      </Card>

      <FlightSearchModal
        isSearchModalOpen={isSearchModalOpen}
        setIsSearchModalOpen={setIsSearchModalOpen}
        isDetail={true}
        handleSelectFlight={handleSelectFlight}
      ></FlightSearchModal>
      <SeatPickerModal
        visible={isSeatModalOpen}
        onClose={() => {
          setIsSeatModalOpen(false);
          setCurrentPassengerKey(null);
        }}
        onSelect={assignSeat}
        assignedSeats={getAssignedSeats()}
        seatmapData={seatmapData}
      />
      <Modal
        title={<span style={{ color: "#d4380d" }}>Thêm khách hàng mới</span>}
        open={isCustomerModalOpen}
        onCancel={() => setIsCustomerModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsCustomerModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={() => {
              formData
                .validateFields()
                .then(async (values) => {
                  const newCustomer = {
                    id: Date.now(),
                    full_name: values.full_name,
                    phone: values.phone,
                    email: values.email,
                    dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
                    address: values.address || "Chưa cập nhật",
                  };
                  const createdCustomer = await createUser(newCustomer);
                  setCustomers((prev) => [...prev, createdCustomer]);
                  setBookingCustomer(createdCustomer);
                  setIsCustomerModalOpen(false);
                  Swal.fire({
                    icon: "success",
                    title: "Đã thêm khách hàng mới!",
                    showConfirmButton: false,
                    timer: 1500,
                  });
                  formData.resetFields();
                })
                .catch((info) => {
                  console.log("Validate Failed:", info);
                });
            }}
          >
            Lưu
          </Button>,
        ]}
      >
        <Form
          form={formData}
          layout="vertical"
          initialValues={{
            full_name: "",
            phone: "",
            email: "",
            dob: null,
            address: "",
          }}
        >
          <Form.Item
            label="Họ tên"
            name="full_name"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input placeholder="090..." />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="email@example.com" />
          </Form.Item>

          <Form.Item label="Ngày sinh" name="dob">
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Địa chỉ" name="address">
            <Input placeholder="Nhập địa chỉ (tùy chọn)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InvoiceCreateForm;
