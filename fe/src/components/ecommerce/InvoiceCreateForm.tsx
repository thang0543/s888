import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Table,
  Modal,
  Card,
  Space,
  Tag,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import Swal from "sweetalert2";

const { Option } = Select;

type PassengerType = "adult" | "child" | "infant";
interface Passenger {
  key: number;
  full_name: string;
  type: PassengerType;
  passport_no: string;
  dob: string;
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

export const InvoiceCreateForm: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([
    { key: 1, full_name: "", type: "adult", passport_no: "", dob: "" },
  ]);

  const handleSearchFlights = (values: any) => {
    setTimeout(() => {
      setSearchResults(mockFlights);
    }, 500);
  };

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
    setPassengers([
      ...passengers,
      {
        key: Date.now(),
        full_name: "",
        type: "adult",
        passport_no: "",
        dob: "",
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

  const totalAmount = selectedFlight
    ? selectedFlight.total_price * adultCount +
      selectedFlight.total_price * 0.75 * childCount +
      selectedFlight.total_price * 0.1 * infantCount
    : 0;

  const handleSave = () => {
    if (!selectedFlight)
      return Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Chưa chọn chuyến bay",
        confirmButtonText: "OK",
      });
    if (passengers.some((p) => !p.full_name || !p.passport_no))
      return Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Nhập đầy đủ hành khách",
        confirmButtonText: "OK",
      });

    Swal.fire({
      icon: "success",
      title: "Lưu hóa đơn thành công!",
      showConfirmButton: true,
    });
  };

  const passengerColumns = [
    {
      title: "Họ tên",
      width: 180,
      render: (_: any, record: Passenger) => (
        <Input
          value={record.full_name}
          onChange={(e) =>
            updatePassenger(record.key, "full_name", e.target.value)
          }
          placeholder="Nguyễn Văn A"
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
        />
      ),
    },
    {
      title: "Ngày sinh",
      width: 130,
      render: (_: any, record: Passenger) => (
        <DatePicker
          value={record.dob ? dayjs(record.dob) : undefined}
          onChange={(_, dateString) =>
            updatePassenger(record.key, "dob", dateString)
          }
          style={{ width: "100%" }}
        />
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
                  scroll={{ y: 380 }}
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
                <div>
                  <p>
                    <strong>Mã chuyến:</strong> {selectedFlight.flight_code}
                  </p>
                  <p>
                    <strong>Hãng:</strong> {selectedFlight.airline.name}
                  </p>
                  <p>
                    <strong>Tuyến bay:</strong>{" "}
                    {selectedFlight.route.from_airport} to{" "}
                    {selectedFlight.route.to_airport}
                  </p>
                  <p>
                    <strong>Khởi hành:</strong>{" "}
                    {dayjs(selectedFlight.departure_time).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </p>
                  <p>
                    <strong>Giá cơ bản:</strong>{" "}
                    {selectedFlight.total_price.toLocaleString()}đ
                  </p>
                </div>
              ) : (
                <p style={{ color: "#999", fontStyle: "italic" }}>
                  Chưa chọn chuyến bay
                </p>
              )}
            </Card>

            <Card
              title={
                <span style={{ color: "#d4380d" }}>
                  tổng tiền hay bill thanh toán
                </span>
              }
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Statistic
                  title="Tổng tiền"
                  value={totalAmount}
                  suffix=" VND"
                  valueStyle={{ color: "#3f8600", fontWeight: "bold" }}
                />
                <Form.Item label="Phương thức" style={{ marginBottom: 8 }}>
                  <Select defaultValue="agency_credit">
                    <Option value="agency_credit">Tín dụng đại lý</Option>
                    <Option value="bank_transfer">Chuyển khoản</Option>
                    <Option value="credit_card">Thẻ tín dụng</Option>
                  </Select>
                </Form.Item>
              </Space>
            </Card>
          </Col>
        </Row>

        <div style={{ textAlign: "right", marginTop: 24 }}>
          <Button
            type="primary"
            danger
            size="large"
            style={{ minWidth: 120, fontWeight: "bold" }}
            onClick={handleSave}
          >
            Lưu
          </Button>
        </div>
      </Card>

      <Modal
        title="Tìm kiếm chuyến bay"
        open={isSearchModalOpen}
        onCancel={() => setIsSearchModalOpen(false)}
        footer={null}
        width={800}
      >
        <Form
          form={searchForm}
          onFinish={handleSearchFlights}
          layout="inline"
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="from_airport">
            <Input placeholder="SGN" />
          </Form.Item>
          <Form.Item name="to_airport">
            <Input placeholder="HAN" />
          </Form.Item>
          <Form.Item name="departure_date">
            <DatePicker />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
            Tìm
          </Button>
        </Form>

        <Table
          dataSource={searchResults}
          rowKey="id"
          size="small"
          onRow={(record) => ({ onClick: () => handleSelectFlight(record) })}
          style={{ cursor: "pointer" }}
        >
          <Table.Column title="Mã" dataIndex="flight_code" width={80} />
          <Table.Column title="Hãng" render={(_, r: any) => r.airline.name} />
          <Table.Column
            title="Tuyến"
            render={(_, r: any) =>
              `${r.route.from_airport} to ${r.route.to_airport}`
            }
          />
          <Table.Column
            title="Giờ bay"
            render={(_, r: any) => dayjs(r.departure_time).format("HH:mm")}
          />
          <Table.Column
            title="Giá"
            render={(_, r: any) => r.total_price.toLocaleString() + "đ"}
          />
          <Table.Column
            title=""
            render={(_, r: any) => (
              <Button
                size="small"
                type="link"
                onClick={() => handleSelectFlight(r)}
              >
                Chọn
              </Button>
            )}
          />
        </Table>
      </Modal>
    </div>
  );
};
