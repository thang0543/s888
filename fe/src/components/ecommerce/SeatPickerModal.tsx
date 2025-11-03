import { Button, Modal, Space, Tag, Tooltip } from "antd";
import { useState } from "react";
import { SwapOutlined } from "@ant-design/icons";

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

const SeatPickerModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelect: (seat: string, price: string) => void;
  assignedSeats: Set<string>;
  seatmapData: SeatmapData;
}> = ({ visible, onClose, onSelect, assignedSeats, seatmapData }) => {
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  const toggleSeat = (seat: Seat) => {
    if (!seat.available || assignedSeats.has(seat.number)) return;
    setSelectedSeat(selectedSeat?.number === seat.number ? null : seat);
  };

  return (
    <Modal
      title={
        <Space>
          <SwapOutlined />
          <span>Chọn Ghế - {seatmapData.designatorCode}</span>
          <Tag color="blue">{seatmapData.cabin.class}</Tag>
          <Tag color="green">
            {seatmapData.cabin.rows.flatMap(r => r.seats).filter(s => s.available && !assignedSeats.has(s.number)).length} trống
          </Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={950}
      footer={[
        <Button key="cancel" onClick={onClose}>Hủy</Button>,
        <Button
          key="ok"
          type="primary"
          disabled={!selectedSeat}
          onClick={() => selectedSeat && onSelect(selectedSeat.number, selectedSeat.price)}
        >
          Xác nhận ({selectedSeat?.price || '0 EUR'})
        </Button>
      ]}
    >
      <div style={{ maxHeight: 580, overflow: 'auto', padding: '0 16px' }}>
        <div style={{ textAlign: 'center', margin: '16px 0', fontWeight: 'bold', color: '#1890ff' }}>
          MŨI MÁY BAY
        </div>

        {seatmapData.cabin.rows.map((row) => (
          <div
            key={row.number}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 10,
              gap: 8
            }}
          >
            <span style={{ width: 32, fontSize: 12, fontWeight: 'bold', color: '#666' }}>
              {row.number}
            </span>

            {/* Ghế trái: A B C */}
            <div style={{ display: 'flex', gap: 5 }}>
              {row.seats.slice(0, 3).map((seat) => (
                <SeatButton
                  key={seat.number}
                  seat={seat}
                  isSelected={selectedSeat?.number === seat.number}
                  isAssigned={assignedSeats.has(seat.number)}
                  onClick={() => toggleSeat(seat)}
                />
              ))}
            </div>

            <div style={{ width: 60, textAlign: 'center', color: '#999', fontSize: 10 }}>
              LỐI ĐI
            </div>

            {/* Ghế phải: D E F */}
            <div style={{ display: 'flex', gap: 5 }}>
              {row.seats.slice(3, 6).map((seat) => (
                <SeatButton
                  key={seat.number}
                  seat={seat}
                  isSelected={selectedSeat?.number === seat.number}
                  isAssigned={assignedSeats.has(seat.number)}
                  onClick={() => toggleSeat(seat)}
                />
              ))}
            </div>

            <span style={{ width: 32, fontSize: 12, fontWeight: 'bold', color: '#666' }}>
              {row.number}
            </span>
          </div>
        ))}

        <div style={{ textAlign: 'center', margin: '20px 0', fontWeight: 'bold', color: '#1890ff' }}>
          ĐUÔI MÁY BAY
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '12px', background: '#f6ffed', borderRadius: 8 }}>
        <Space size="middle">
          <span><div style={{ display: 'inline-block', width: 16, height: 16, background: '#fff', border: '2px solid #d9d9d9', borderRadius: 4, marginRight: 4 }}></div> Trống</span>
          <span><div style={{ display: 'inline-block', width: 16, height: 16, background: '#52c41a', borderRadius: 4, marginRight: 4 }}></div> Đang chọn</span>
          <span><div style={{ display: 'inline-block', width: 16, height: 16, background: '#ff4d4f', borderRadius: 4, marginRight: 4 }}></div> Đã chọn</span>
          <span><div style={{ display: 'inline-block', width: 16, height: 16, background: '#d9d9d9', borderRadius: 4, marginRight: 4 }}></div> Không khả dụng</span>
        </Space>
      </div>
    </Modal>
  );
};

const SeatButton: React.FC<{
  seat: Seat;
  isSelected: boolean;
  isAssigned: boolean;
  onClick: () => void;
}> = ({ seat, isSelected, isAssigned, onClick }) => {
  const isExit = seat.characteristics.includes("EXIT");
  const isWindow = seat.characteristics.includes("WINDOW");
  const isAisle = seat.characteristics.includes("AISLE");

  const isBlocked = !seat.available || isAssigned;

  return (
    <Tooltip
      title={
        isBlocked
          ? `${seat.number} - ${isAssigned ? 'Đã được chọn' : 'Không khả dụng'}`
          : `${seat.number} - ${seat.price} - ${seat.characteristics.join(', ')}`
      }
    >
      <div
        onClick={isBlocked ? undefined : onClick}
        style={{
          width: 38,
          height: 38,
          borderRadius: 8,
          cursor: isBlocked ? 'not-allowed' : 'pointer',
          background: !seat.available
            ? '#d9d9d9'
            : isAssigned
            ? '#ff4d4f'
            : isSelected
            ? '#52c41a'
            : '#fff',
          border: `2.5px solid ${
            isExit
              ? '#fa8c16'
              : isWindow
              ? '#1890ff'
              : isAisle
              ? '#722ed1'
              : isSelected
              ? '#52c41a'
              : '#d9d9d9'
          }`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 9,
          fontWeight: 'bold',
          color: isSelected || isAssigned ? '#fff' : '#000',
          transition: 'all 0.2s',
          opacity: isBlocked ? 0.65 : 1,
          boxShadow: isSelected ? '0 0 10px rgba(82,196,26,0.6)' : 'none'
        }}
      >
        <div>{seat.number.slice(-1)}</div>
        <div style={{ fontSize: 7, marginTop: 1 }}>
          {isBlocked ? '' : seat.price + ' EUR'}
        </div>
      </div>
    </Tooltip>
  );
};

export default SeatPickerModal;