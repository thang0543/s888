import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Row,
  Col,
  Select,
  Input,
  Button,
  Space,
  message,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import {
  deleteBookingInvoice,
  getInvoiceSummaries,
} from "../../hooks/invoiceApi";
import { getAllRoutes, RouterResDTO } from "../../hooks/routeApi";
import { AirlineResDTO, getAllAirlines } from "../../hooks/AirlineApi";
import Swal from "sweetalert2";

const { Option } = Select;

interface InvoiceSummaryDTO {
  invoiceId: number;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  flightCode: string;
  departureTime: string;
  arrivalTime: string;
  airlineName: string;
  route: string;
  totalAmountCurrency: string;
  status: string;
  discountAmount: string;
}

const InvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceSummaryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [airlineId, setAirlineId] = useState<number | undefined>(undefined);
  const [routeId, setRouteId] = useState<number | undefined>(undefined);
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const [searchText, setSearchText] = useState("");
  const [routes, setRoutes] = useState<RouterResDTO[]>([]);
  const [airlines, setAirlines] = useState<AirlineResDTO[]>([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const data = await getAllRoutes();
        setRoutes(data);
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể tải danh sách tuyến bay",
          confirmButtonText: "OK",
        });
      }
    };
    fetchRoutes();
    const fetchAirlines = async () => {
      try {
        const data = await getAllAirlines();
        setAirlines(data);
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể tải danh sách tuyến bay",
          confirmButtonText: "OK",
        });
      }
    };
    fetchAirlines();
  }, []);

  const routeOptions = routes
    .map((r) => {
      if (!r.segments || r.segments.length === 0) return null;
      const sorted = [...r.segments].sort((a, b) => a.sequence - b.sequence);
      const from = sorted[0].fromAirport;
      const to = sorted[sorted.length - 1].toAirport;
      return (
        <Option key={r.id} value={r.id}>
          {from} - {to}
        </Option>
      );
    })
    .filter(Boolean);
  const airlineOptions = airlines.map((a) => (
    <Option key={a.id} value={a.id}>
      {a.name}
    </Option>
  ));

  const navigate = useNavigate();

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      let data = await getInvoiceSummaries(airlineId, routeId, customerId);

      if (searchText) {
        data = data.filter(
          (inv) =>
            inv.customerName
              ?.toLowerCase()
              .includes(searchText.toLowerCase()) ||
            inv.invoiceNumber
              ?.toLowerCase()
              .includes(searchText.toLowerCase()) ||
            inv.flightCode?.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      setInvoices(data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Lấy danh sách hóa đơn thất bại",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Xác nhận xóa hóa đơn tạm thời",
      text: "Bạn có chắc muốn xóa hóa đơn tạm thời này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteBookingInvoice(id);
          Swal.fire({
            icon: "success",
            title: "🗑️ Đã xóa hóa đơn tạm thời",
            showConfirmButton: false,
            timer: 1500,
          });
          fetchInvoices();
        } catch (err) {
          console.error(err);
          Swal.fire({
            icon: "error",
            title: "Xóa hóa đơn thất bại",
            text: err.response?.data?.message || undefined,
          });
        }
      }
    });
  };

  useEffect(() => {
    fetchInvoices();
  }, [airlineId, routeId, customerId]);

  const columns = [
    {
      title: "Mã hóa đơn",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
    },
    {
      title: "Ngày hóa đơn",
      dataIndex: "invoiceDate",
      key: "invoiceDate",
      render: (text: string) => dayjs(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Mã chuyến bay",
      dataIndex: "flightCode",
      key: "flightCode",
    },
    {
      title: "Hãng hàng không",
      dataIndex: "airlineName",
      key: "airlineName",
    },
    {
      title: "Tuyến bay",
      dataIndex: "route",
      key: "route",
    },
    {
      title: "Khởi hành",
      dataIndex: "departureTime",
      key: "departureTime",
      render: (text: string) => dayjs(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Hạ cánh",
      dataIndex: "arrivalTime",
      key: "arrivalTime",
      render: (text: string) => dayjs(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmountCurrency",
      key: "totalAmountCurrency",
    },
    {
      title: "Tiền giảm",
      dataIndex: "discountAmount",
      key: "discountAmount",
    },
    {
      title: "Lợi thuận",
      dataIndex: "profit",
      key: "profit",
      render: (value) => `${value} EUR`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) =>
        status === "TEMP" ? (
          <span style={{ color: "orange", fontWeight: "bold" }}>
            🕓 Lưu tạm
          </span>
        ) : (
          <span style={{ color: "green", fontWeight: "bold" }}>
            ✅ Hoàn tất
          </span>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center" as const,
      render: (_: any, record: InvoiceSummaryDTO) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/invoice/detail/${record.invoiceId}`)}
          />
          {record.status === "TEMP" && (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: "#faad14" }} />}
              title="Chỉnh sửa"
              onClick={() => navigate(`/invoice/edit/${record.invoiceId}`)}
            />
          )}
          {record.status === "TEMP" && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.invoiceId)}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Danh sách Hóa đơn"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/invoice/create")}
          >
            Tạo hóa đơn
          </Button>
        }
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Select
              placeholder="Chọn hãng hàng không"
              style={{ width: "100%", marginBottom: 8 }}
              allowClear
              onChange={(val) => setAirlineId(val)}
            >
              {airlineOptions}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="Chọn tuyến bay"
              style={{ width: "100%" }}
              allowClear
              onChange={(val) => setRouteId(val)}
            >
              {routeOptions}
            </Select>
          </Col>
          <Col span={6}>
            <Input
              placeholder="Tìm khách hàng, mã hóa đơn, chuyến bay"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={fetchInvoices}
            />
          </Col>
          <Col span={6}>
            <Button
              type="default"
              icon={<SearchOutlined />}
              onClick={fetchInvoices}
              style={{ width: "100%" }}
            >
              Tìm kiếm
            </Button>
          </Col>
        </Row>

        <Table
          dataSource={invoices}
          columns={columns}
          rowKey="invoiceId"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
};

export default InvoiceList;
