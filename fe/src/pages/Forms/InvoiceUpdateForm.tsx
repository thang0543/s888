import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Table,
  Card,
  message,
  Space,
  Tag,
  Row,
  Col,
  Avatar,
  Divider,
  Alert,
  Statistic,
  Modal,
} from "antd";
import {
  UserOutlined,
  SwapOutlined,
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";

import FlightSearchModal from "../../components/ecommerce/FlightSearchModal";
import SeatPickerModal from "../../components/ecommerce/SeatPickerModal";
import { rawSeatmapData } from "../../hooks/amadeusApi";
import { getUsers, createUser } from "../../hooks/userApi";
import { getPromotions, DiscountCode } from "../../hooks/promotionApi";
import {
  createBookingTransaction,
  updateBookingTransaction,
  getInvoiceBookingDetail,
} from "../../hooks/invoiceApi";
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

const InvoiceForm: React.FC = () => {
  const { id: invoiceId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!invoiceId;

  const [form] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [customerForm] = Form.useForm();

  const [mode] = useState<"create" | "edit">(isEdit ? "edit" : "create");
  const [loading, setLoading] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [bookingCustomer, setBookingCustomer] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<DiscountCode[]>([]);
  const [selectedPromotion, setSelectedPromotion] =
    useState<DiscountCode | null>(null);

  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [currentPassengerKey, setCurrentPassengerKey] = useState<number | null>(
    null
  );
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const fetchBooking = async () => {
    if (!invoiceId) return;
    setLoading(true);
    try {
      const data = await getInvoiceBookingDetail(invoiceId);
      setOriginalData(data);
      loadDataForEdit(data);
    } catch (e: any) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: e?.response?.data?.message || "Không tải được dữ liệu",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDataForEdit = (data: any) => {
    setSelectedFlight({
      id: data.flight.id,
      flight_code: data.flight.code,
      airline: data.flight.airline,
      from_airport: data.flight.from,
      to_airport: data.flight.to,
      departure_time: data.flight.departureTime,
      arrival_time: data.flight.arrivalTime,
      total_price:
        data.summary.baseAmount /
        (data.summary.adultCount +
          data.summary.childCount * 0.75 +
          data.summary.infantCount * 0.1),
      duration: data.flight.duration || "2h",
    });

    const mapped = data.passengers.map((p: any, i: number) => ({
      key: Date.now() + i,
      full_name: p.fullName,
      type: p.type,
      passport_no: p.passportNo,
      dob: p.dob ? dayjs(p.dob).format("DD/MM/YYYY") : "",
      country: p.country || "",
      phone: p.phone || "",
      email: p.email || "",
      address: p.address || "",
      seat: p.seat,
      seatPrice: p.seatPrice ? `${p.seatPrice} EUR` : "",
    }));
    setPassengers(mapped);

    if (data.customer) setBookingCustomer(data.customer);
  };

  useEffect(() => {
    Promise.all([getPromotions(), getUsers()]).then(([p, u]) => {
      setPromotions(p);
      setCustomers(u);
    });
    if (isEdit) fetchBooking();
    else initEmptyPassenger();
  }, []);

  const initEmptyPassenger = () => {
    setPassengers([
      {
        key: Date.now(),
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

  const adultCount = passengers.filter((p) => p.type === "adult").length;
  const childCount = passengers.filter((p) => p.type === "child").length;
  const infantCount = passengers.filter((p) => p.type === "infant").length;

  const seatTotal = passengers.reduce((s, p) => {
    const v = p.seatPrice?.replace(" EUR", "") || "0";
    return s + parseFloat(v);
  }, 0);

  const basePrice = selectedFlight?.total_price || 0;
  const baseAmount =
    basePrice * adultCount +
    basePrice * 0.75 * childCount +
    basePrice * 0.1 * infantCount;
  const totalAmount = baseAmount + seatTotal;

  const discountedTotal = useMemo(() => {
    if (!selectedPromotion) return totalAmount;
    let disc = 0;
    if (selectedPromotion.discountType === "PERCENT") {
      disc = (baseAmount * selectedPromotion.discountValue) / 100;
      if (selectedPromotion.maxDiscount)
        disc = Math.min(disc, selectedPromotion.maxDiscount);
    } else {
      disc = selectedPromotion.discountValue;
    }
    return Math.max(totalAmount - disc, 0);
  }, [selectedPromotion, baseAmount, totalAmount]);

  const discountAmount = totalAmount - discountedTotal;

  const updatePassenger = (key: number, field: keyof Passenger, value: any) => {
    setPassengers((prev) =>
      prev.map((p) => (p.key === key ? { ...p, [field]: value } : p))
    );
    setHasChanges(true);
  };

  const addPassenger = () => {
    setPassengers((prev) => [
      ...prev,
      {
        key: Date.now(),
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
    setHasChanges(true);
  };

  const removePassenger = (key: number) => {
    if (passengers.length === 1) return;
    setPassengers((prev) => prev.filter((p) => p.key !== key));
    setHasChanges(true);
  };

  const openSeatPicker = (key: number) => {
    if (!selectedFlight)
      return Swal.fire({
        icon: "warning",
        title: "Cảnh báo",
        text: "Chọn chuyến bay trước",
        confirmButtonText: "OK",
      });
    setCurrentPassengerKey(key);
    setIsSeatModalOpen(true);
  };

  const assignSeat = (seatId: string, price: string) => {
    if (!currentPassengerKey) return;
    updatePassenger(currentPassengerKey, "seat", seatId);
    updatePassenger(currentPassengerKey, "seatPrice", price);
    setIsSeatModalOpen(false);
    setCurrentPassengerKey(null);
  };

  const assignedSeats = (): Map<string, string> => {
    const map = new Map();
    passengers.forEach((p) => {
      if (p.seat && p.key !== currentPassengerKey) map.set(p.seat, p.full_name);
    });
    return map;
  };

  const seatmapData = useMemo(() => {
    const labels = ["A", "B", "C", "D", "E", "F"];
    const rows: any[] = [];
    for (let r = 1; r <= 40; r++) {
      const seats = labels.map((l) => ({
        number: `${r}${l}`,
        available: Math.random() > 0.25,
        price: `${[20, 25, 30][Math.floor(Math.random() * 3)]} EUR`,
        characteristics:
          l === "A" || l === "F"
            ? ["WINDOW"]
            : l === "C" || l === "D"
            ? ["AISLE"]
            : [],
      }));
      rows.push({ number: r.toString(), seats });
    }
    return { cabin: { rows } };
  }, []);

  const handleSave = async (status: "TEMP" | "PAIN") => {
    if (!selectedFlight)
      return Swal.fire({
        icon: "warning",
        title: "Cảnh báo",
        text: "Chọn chuyến bay",
        confirmButtonText: "OK",
      });
    if (passengers.some((p) => !p.full_name || !p.passport_no))
      return Swal.fire({
        icon: "warning",
        title: "Cảnh báo",
        text: "Nhập đầy đủ hành khách",
        confirmButtonText: "OK",
      });

    const payload: any = {
      id: isEdit ? originalData.id : undefined,
      customerId: bookingCustomer?.id || 0,
      flight: {
        id: selectedFlight.id,
        code: selectedFlight.flight_code,
        airline: selectedFlight.airline,
        from: selectedFlight.from_airport,
        to: selectedFlight.to_airport,
        departureTime: selectedFlight.departure_time,
        arrivalTime: selectedFlight.arrival_time,
        basePrice: basePrice,
        duration: selectedFlight.duration,
      },
      passengers: passengers.map((p) => ({
        fullName: p.full_name,
        type: p.type,
        passportNo: p.passport_no,
        seat: p.seat || "",
        seatPrice: p.seatPrice
          ? parseFloat(p.seatPrice.replace(" EUR", "")) || 0
          : 0,
        dob: p.dob,
        email: p.email,
        phone: p.phone,
        country: p.country,
        address: p.address,
        priceFlight:
          p.type === "adult"
            ? basePrice
            : p.type === "child"
            ? basePrice * 0.75
            : basePrice * 0.1,
      })),
      summary: {
        adultCount,
        childCount,
        infantCount,
        baseAmount,
        seatTotal,
        totalAmount: discountedTotal,
        discountAmount,
        currency: "EUR",
      },
      paymentMethod:
        status === "TEMP"
          ? ""
          : (await paymentForm.validateFields()).paymentMethod,
      promotionId: selectedPromotion?.id || 0,
      status,
      hasChanges: isEdit ? hasChanges : false,
    };

    setLoading(true);
    try {
      const res = (await isEdit)
        ? updateBookingTransaction(invoiceId, payload)
        : createBookingTransaction(payload);
      Swal.fire({
        title: "Thành công!",
        text: isEdit
          ? "Hóa đơn đã được cập nhật và thanh toán thêm đã được ghi nhận."
          : "Hóa đơn đã được cập nhật thành công.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/invoice");
      });
      if (status !== "TEMP") navigate("/invoice");
    } catch (e: any) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: e?.response?.data?.message || "Lỗi hệ thống",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const passengerColumns = [
    {
      title: "Họ tên",
      width: 150,
      render: (_: any, r: Passenger) => (
        <Input
          value={r.full_name}
          onChange={(e) => updatePassenger(r.key, "full_name", e.target.value)}
          prefix={<UserOutlined />}
          placeholder="Nguyễn Văn A"
        />
      ),
    },
    {
      title: "Loại",
      width: 100,
      render: (_: any, r: Passenger) => (
        <Select
          value={r.type}
          onChange={(v) => updatePassenger(r.key, "type", v)}
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
      render: (_: any, r: Passenger) => (
        <Input
          value={r.passport_no}
          onChange={(e) =>
            updatePassenger(r.key, "passport_no", e.target.value)
          }
        />
      ),
    },
    {
      title: "Ngày sinh",
      width: 130,
      render: (_: any, r: Passenger) => (
        <DatePicker
          value={r.dob ? dayjs(r.dob, "DD/MM/YYYY") : undefined}
          onChange={(_, s) => updatePassenger(r.key, "dob", s)}
          format="DD/MM/YYYY"
          style={{ width: "100%" }}
          disabledDate={(c) => c && c >= dayjs().startOf("day")}
        />
      ),
    },
    {
      title: "Ghế",
      width: 100,
      render: (_: any, r: Passenger) => (
        <Button
          type={r.seat ? "primary" : "default"}
          size="small"
          icon={<SwapOutlined />}
          onClick={() => openSeatPicker(r.key)}
          style={{ width: "100%" }}
        >
          {r.seat || "Chọn"}
        </Button>
      ),
    },
    {
      title: "",
      width: 50,
      render: (_: any, r: Passenger) =>
        passengers.length > 1 && (
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => removePassenger(r.key)}
          />
        ),
    },
  ];

  if (loading)
    return <div style={{ padding: 50, textAlign: "center" }}>Đang tải...</div>;

  return (
    <div style={{ padding: 24, background: "#f9f9f9", minHeight: "100vh" }}>
      <Card
        title={
          isEdit ? `Chỉnh sửa hóa đơn ${originalData?.id}` : "Tạo hóa đơn mới"
        }
        extra={<Button onClick={() => navigate(-1)}>Quay lại</Button>}
        style={{ maxWidth: 1200, margin: "0 auto" }}
      >
        <Row gutter={24}>
          <Col span={16}>
            <Card
              title="Thông tin hành khách"
              extra={
                <Button icon={<PlusOutlined />} onClick={addPassenger}>
                  Thêm
                </Button>
              }
            >
              <Table
                dataSource={passengers}
                columns={passengerColumns}
                pagination={false}
                size="small"
                scroll={{ y: 380 }}
                rowKey="key"
              />
            </Card>

            <Card
              title="Chuyến bay"
              style={{ marginTop: 16 }}
              extra={
                <Button
                  type="link"
                  icon={<SearchOutlined />}
                  onClick={() => setIsFlightModalOpen(true)}
                >
                  Tìm
                </Button>
              }
            >
              {selectedFlight ? (
                <div style={{ lineHeight: 1.8 }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#d4380d",
                    }}
                  >
                    {selectedFlight.flight_code} • {selectedFlight.airline}
                  </div>
                  <div>
                    {selectedFlight.from_airport} → {selectedFlight.to_airport}
                  </div>
                  <div>
                    {dayjs(selectedFlight.departure_time).format("DD/MM HH:mm")}{" "}
                    → {dayjs(selectedFlight.arrival_time).format("HH:mm")} (
                    {selectedFlight.duration})
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    color: "#999",
                    padding: "30px 0",
                  }}
                >
                  <SearchOutlined style={{ fontSize: 32 }} />
                  <br />
                  Chưa chọn chuyến bay
                </div>
              )}
            </Card>
          </Col>

          <Col span={8}>
            <Card title="Thanh toán">
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>
                    <UserOutlined
                      style={{ marginRight: 6, color: "#d4380d" }}
                    />
                    Khách hàng đặt vé
                  </div>
                  <Select
                    showSearch
                    placeholder="Tìm khách hàng"
                    value={bookingCustomer?.id}
                    onChange={(v) =>
                      setBookingCustomer(customers.find((c) => c.id === v))
                    }
                    style={{ width: "100%" }}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: "4px 0" }} />
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          block
                          onClick={() => setIsCustomerModalOpen(true)}
                        >
                          Thêm khách hàng mới
                        </Button>
                      </>
                    )}
                  >
                    {customers.map((c) => (
                      <Option key={c.id} value={c.id}>
                        {c.fullName}
                      </Option>
                    ))}
                  </Select>
                  {bookingCustomer && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: 8,
                        background: "#e6f7ff",
                        borderRadius: 6,
                      }}
                    >
                      <Avatar icon={<UserOutlined />} />{" "}
                      <strong>{bookingCustomer.fullName}</strong>
                      <br />
                      <small>
                        {bookingCustomer.phoneNumber} • {bookingCustomer.email}
                      </small>
                    </div>
                  )}
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>
                    Tiền vé cơ bản
                    <Tag style={{ marginLeft: 8 }} color="blue">
                      {adultCount}NL + {childCount}TE + {infantCount}EB
                    </Tag>
                  </span>
                  <strong>{baseAmount.toLocaleString()} EUR</strong>
                </div>

                {seatTotal > 0 && (
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>Phụ thu ghế</span>
                    <strong>{seatTotal.toLocaleString()} EUR</strong>
                  </div>
                )}

                <Form.Item label="Mã khuyến mãi">
                  <Select
                    allowClear
                    placeholder="Chọn mã"
                    onChange={(v) =>
                      setSelectedPromotion(
                        promotions.find((p) => p.id === v) || null
                      )
                    }
                  >
                    {promotions.map((p) => (
                      <Option key={p.id} value={p.id}>
                        {p.code} - {p.description}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <div
                  style={{
                    padding: 16,
                    background: hasChanges ? "#fff2e8" : "#f6ffed",
                    borderRadius: 8,
                    border: `2px solid ${hasChanges ? "#ff7a45" : "#52c41a"}`,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: "bold" }}>
                    TỔNG CỘNG {hasChanges ? "(có thay đổi)" : ""}
                  </div>
                  <Statistic
                    value={discountedTotal}
                    precision={2}
                    suffix=" EUR"
                    valueStyle={{
                      fontSize: 24,
                      color: hasChanges ? "#d4380d" : "#389e0d",
                    }}
                  />
                </div>

                <Form form={paymentForm} layout="vertical">
                  <Form.Item
                    name="paymentMethod"
                    label="Phương thức thanh toán"
                    rules={[{ required: true, message: "Chọn phương thức" }]}
                  >
                    <Select placeholder="Chọn">
                      <Option value="agency_credit">Tín dụng đại lý</Option>
                      <Option value="bank_transfer">Chuyển khoản</Option>
                      <Option value="credit_card">Thẻ tín dụng</Option>
                    </Select>
                  </Form.Item>
                </Form>
              </Space>
            </Card>
          </Col>
        </Row>

        <div style={{ textAlign: "right", marginTop: 24 }}>
          <Space>
            <Button size="large" onClick={() => handleSave("TEMP")}>
              Lưu tạm
            </Button>
            <Button
              type="primary"
              danger
              size="large"
              loading={loading}
              disabled={isEdit && !hasChanges}
              onClick={() => handleSave("PAIN")}
            >
              {isEdit ? "Cập nhật" : "Hoàn tất"}
            </Button>
          </Space>
        </div>
      </Card>

      <FlightSearchModal
        isSearchModalOpen={isFlightModalOpen}
        setIsSearchModalOpen={setIsFlightModalOpen}
        isDetail={true}
        handleSelectFlight={(f) => {
          setSelectedFlight(f);
          setIsFlightModalOpen(false);
          setHasChanges(true);
        }}
      />

      <SeatPickerModal
        visible={isSeatModalOpen}
        onClose={() => {
          setIsSeatModalOpen(false);
          setCurrentPassengerKey(null);
        }}
        onSelect={assignSeat}
        assignedSeats={assignedSeats()}
        seatmapData={seatmapData}
      />

      <Modal
        title="Thêm khách hàng mới"
        open={isCustomerModalOpen}
        onCancel={() => setIsCustomerModalOpen(false)}
        footer={null}
      >
        <Form
          form={customerForm}
          layout="vertical"
          onFinish={async (v) => {
            const newCust = await createUser({
              full_name: v.full_name,
              phone: v.phone,
              email: v.email,
              dob: v.dob?.format("YYYY-MM-DD"),
              address: v.address,
            });
            setCustomers((prev) => [...prev, newCust]);
            setBookingCustomer(newCust);
            setIsCustomerModalOpen(false);
            Swal.fire({
              icon: "success",
              title: "Thêm khách hàng thành công",
              showConfirmButton: false,
              timer: 1500,
            });
            customerForm.resetFields();
          }}
        >
          <Form.Item
            name="full_name"
            label="Họ tên"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="SĐT" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="dob" label="Ngày sinh">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input />
          </Form.Item>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={() => setIsCustomerModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default InvoiceForm;
