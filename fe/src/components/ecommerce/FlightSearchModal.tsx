import React, { useState } from "react";
import { Modal, Form, Select, DatePicker, Button, Table, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { AmadeusService } from "../../hooks/amadeusApi";

const amadeusService = new AmadeusService();

export const FlightSearchModal = ({
  isSearchModalOpen,
  setIsSearchModalOpen,
  handleSelectFlight,
  isDetail = true,
  fromAirport,
  toAirport,
  airlineCodes = [],
}: {
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (v: boolean) => void;
  handleSelectFlight: (flight: any) => void;
  isDetail?: boolean;
  fromAirport?: string;
  toAirport?: string;
  airlineCodes?: string[];
}) => {
  const [searchForm] = Form.useForm();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const airportOptions = [
    { code: "HAN", name: "Hà Nội (Nội Bài)" },
    { code: "SGN", name: "TP. Hồ Chí Minh (Tân Sơn Nhất)" },
    { code: "DAD", name: "Đà Nẵng (Đà Nẵng)" },
    { code: "CXR", name: "Nha Trang (Cam Ranh)" },
    { code: "PQC", name: "Phú Quốc (Phú Quốc)" },
    { code: "VCA", name: "Cần Thơ (Cần Thơ)" },
  ];

  const handleSearchFlights = async (values: any) => {
    try {
      setLoading(true);
      const from = isDetail ? values.from_airport : fromAirport;
      const to = isDetail ? values.to_airport : toAirport;
      const date = dayjs(values.departure_date).format("YYYY-MM-DD");

      const data = await amadeusService.getFlightOffers(
        from,
        to,
        date,
        airlineCodes
      );
      setSearchResults(data);
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tìm chuyến bay",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Tìm kiếm chuyến bay"
      open={isSearchModalOpen}
      onCancel={() => setIsSearchModalOpen(false)}
      footer={null}
      width={850}
      maskClosable={false}
    >
      <Form
        form={searchForm}
        onFinish={handleSearchFlights}
        layout="inline"
        style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8 }}
      >
        {isDetail && (
          <>
            <Form.Item
              name="from_airport"
              rules={[{ required: true, message: "Chọn điểm đi" }]}
            >
              <Select
                showSearch
                placeholder="Chọn điểm đi"
                options={airportOptions.map((a) => ({
                  label: `${a.name}`,
                  value: a.code,
                }))}
                style={{ width: 200 }}
              />
            </Form.Item>

            <Form.Item
              name="to_airport"
              rules={[{ required: true, message: "Chọn điểm đến" }]}
            >
              <Select
                showSearch
                placeholder="Chọn điểm đến"
                options={airportOptions.map((a) => ({
                  label: `${a.name}`,
                  value: a.code,
                }))}
                style={{ width: 200 }}
              />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="departure_date"
          rules={[{ required: true, message: "Chọn ngày đi" }]}
        >
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
        loading={loading}
        pagination={{ pageSize: 5 }}
        onRow={(record) => ({
          onClick: (e) => {
            e.stopPropagation();
            handleSelectFlight(record);
          },
        })}
      >
        <Table.Column title="Mã chuyến" dataIndex="flight_code" width={100} />
        <Table.Column title="Hãng" dataIndex="airline" width={80} />
        <Table.Column
          title="Tuyến"
          render={(_, r: any) => `${r.from_airport} → ${r.to_airport}`}
        />
        <Table.Column title="Máy bay" dataIndex="aircraft" width={80} />
        <Table.Column title="Hạng vé" dataIndex="cabin_class" width={100} />
        <Table.Column title="Giờ bay" render={(_, r: any) => r.time} />
        <Table.Column title="Thời gian bay" dataIndex="duration" width={100} />
        <Table.Column
          title="Hành lý ký gửi"
          dataIndex="checked_bag"
          width={120}
        />
        <Table.Column
          title="Hành lý xách tay"
          dataIndex="cabin_bag"
          width={120}
        />
        <Table.Column
          title="Giá vé"
          render={(_, r: any) => `${r.total_price.toLocaleString()}`}
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
  );
};

export default FlightSearchModal;
