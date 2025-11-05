import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Card,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  message,
  Popconfirm,
  InputNumber,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  CopyOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  createPromotion,
  getPromotions,
  toggleStatus,
  updatePromotion,
} from "../../hooks/promotionApi";
import { getAllAirlines } from "../../hooks/AirlineApi";
import { getAllRoutes } from "../../hooks/routeApi";
import { getUsers } from "../../hooks/userApi";
import { customer } from "../../hooks/invoiceApi";
import Swal from "sweetalert2";

const { TextArea } = Input;
const { Option } = Select;

interface Airline {
  id: string;
  name: string;
  changeFee: string;
}

interface Route {
  id: number;
  name: string;
}

interface Promotion {
  id: number;
  code: string;
  description: string;
  discountType: "PERCENT" | "AMOUNT";
  discountValue: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  airlineId: number;
  airlineName?: string;
  routerId?: number;
  routeName?: string;
  customerId?: number;
  customerName?: string;
  minFare?: number;
  isActive: boolean;
}

const PromotionManager: React.FC = () => {
  const [form] = Form.useForm();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [customers, setCustomers] = useState<customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [promo, airline, route, cust] = await Promise.all([
        getPromotions(),
        getAllAirlines(),
        getAllRoutes(),
        getUsers(),
      ]);
      setPromotions(promo);
      setAirlines(airline);
      setRoutes(route);
      setCustomers(cust);
    } catch (err: any) {
      message.error("Lỗi tải dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (record?: Promotion) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        ...record,
        startDate: dayjs(record.startDate),
        endDate: dayjs(record.endDate),
        airlineId: record.airlineId,
        routerId: record.routerId,
        customerId: record.customerId,
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        code: values.code.toUpperCase(),
        description: values.description,
        discountType: values.discountType,
        discountValue: values.discountValue,
        maxDiscount: values.maxDiscount || null,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        airlineId: values.airlineId,
        routerId: values.routerId || null,
        customerId: values.customerId || null,
        minFare: values.minFare || null,
        isActive: values.isActive ?? true,
      };

      if (editingId) {
        await updatePromotion(editingId, payload);
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Cập nhật thành công!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await createPromotion(payload);
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Tạo khuyến mãi thành công!",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Lưu thất bại",
        text: err.response?.data || "Đã xảy ra lỗi khi lưu dữ liệu!",
      });
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleStatus(id);
      await Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Xóa khuyến mãi thành công!",
        timer: 2000,
        showConfirmButton: false,
      });
      loadData();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: "Xóa thất bại!",
      });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success(`Đã copy: ${code}`);
  };

  const columns = [
    {
      title: "Mã",
      width: 110,
      render: (_: any, r: Promotion) => (
        <Space>
          <Tag color="blue" style={{ fontWeight: "bold" }}>
            {r.code}
          </Tag>
          <Button
            size="small"
            icon={<CopyOutlined />}
            type="text"
            onClick={() => copyCode(r.code)}
          />
        </Space>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      ellipsis: true,
      width: 220,
    },
    {
      title: "Giảm",
      width: 130,
      render: (_: any, r: Promotion) => (
        <div>
          <Tag color={r.discountType === "PERCENT" ? "green" : "orange"}>
            {r.discountType === "PERCENT"
              ? `${r.discountValue}%`
              : `${r.discountValue} EUR`}
          </Tag>
          {r.maxDiscount && <small>(tối đa {r.maxDiscount} EUR)</small>}
        </div>
      ),
    },
    {
      title: "Hãng",
      width: 120,
      render: (_: any, r: Promotion) => {
        return r.airlineName ? (
          <Tag>{r.airlineName}</Tag>
        ) : (
          <Tag color="gray">Tất cả</Tag>
        );
      },
    },
    {
      title: "Tuyến",
      width: 100,
      render: (_: any, r: Promotion) => {
        return r.nameRouter ? (
          <Tag color="purple">{r.nameRouter}</Tag>
        ) : (
          <Tag color="gray">Tất cả</Tag>
        );
      },
    },
    {
      title: "Khách",
      width: 100,
      render: (_: any, r: Promotion) => {
        const cust = customers.find((c) => c.id === r.customerId);
        return cust ? (
          <Tag color="gold">{cust.fullName}</Tag>
        ) : (
          <Tag color="gray">Tất cả</Tag>
        );
      },
    },
    {
      title: "Thời gian",
      width: 200,
      render: (_: any, r: Promotion) => (
        <div
          style={{
            fontSize: 12,
            color: "#555",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>⏱️</span>
          <span>
            {dayjs(r.startDate).format("DD/MM HH:mm")} -{" "}
            {dayjs(r.endDate).format("DD/MM HH:mm")}
          </span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      width: 90,
      render: (_: any, r: Promotion) => (
        <Tag color={r.isActive ? "green" : "red"}>
          {r.isActive ? "HOẠT ĐỘNG" : "TẠM DỪNG"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      width: 130,
      render: (_: any, r: Promotion) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(r)}
          />
          <Popconfirm
            title={"xóa khuyến mãi?"}
            onConfirm={() => handleToggleStatus(r.id)}
          >
            <Button
              size="small"
              icon={<CheckCircleOutlined />}
              type={"primary"}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f9f9f9", minHeight: "100vh" }}>
      <Card
        title={
          <Space>
            <span style={{ fontSize: 20, fontWeight: "bold" }}>
              Quản lý khuyến mãi
            </span>
            <Tag color="purple">Tổng: {promotions.length}</Tag>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => openModal()}
          >
            Tạo mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={promotions}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1400 }}
          bordered
        />
      </Card>

      <Modal
        title={editingId ? "Chỉnh sửa khuyến mãi" : "Tạo khuyến mãi mới"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setModalOpen(false)}>
            Hủy
          </Button>,
          <Button key="save" type="primary" onClick={handleSave}>
            {editingId ? "Cập nhật" : "Tạo"}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Mã khuyến mãi"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder="SUMMER25"
                  style={{ textTransform: "uppercase" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Trạng thái"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Bật"
                  unCheckedChildren="Tắt"
                  defaultChecked
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true }]}
          >
            <TextArea rows={2} placeholder="Giảm 25% cho hè 2025..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="discountType"
                label="Loại giảm"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn">
                  <Option value="PERCENT">Phần trăm (%)</Option>
                  <Option value="AMOUNT">Số tiền (EUR)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="discountValue"
                label="Giá trị"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maxDiscount" label="Tối đa (EUR)">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Từ ngày"
                rules={[{ required: true }]}
              >
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="Đến ngày"
                rules={[
                  { required: true, message: "Chọn ngày kết thúc" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || !getFieldValue("startDate")) {
                        return Promise.resolve();
                      }
                      if (value.isBefore(getFieldValue("startDate"))) {
                        return Promise.reject(
                          new Error("Ngày kết thúc phải lớn hơn ngày bắt đầu!")
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="airlineId" label="Hãng bay">
                <Select
                  placeholder="Chọn hãng"
                  showSearch
                  optionFilterProp="children"
                >
                  {airlines.map((a) => (
                    <Option key={a.id} value={a.id}>
                      {a.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="routerId" label="Tuyến bay">
                <Select placeholder="Tất cả" allowClear showSearch>
                  {routes.map((r) => (
                    <Option key={r.id} value={r.id}>
                      {r.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="customerId" label="Khách VIP">
                <Select placeholder="Tất cả" allowClear showSearch>
                  {customers.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.fullName} ({c.phoneNumber})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="minFare" label="Giá vé tối thiểu (EUR)">
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="0 = không giới hạn"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PromotionManager;
