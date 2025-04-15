import React, { useEffect } from 'react';
import { notification } from 'antd';
import { PhoneOutlined, MessageOutlined, WarningOutlined } from '@ant-design/icons';

const NotificationSystem = () => {
  useEffect(() => {
    // Set up WebSocket connection for real-time notifications
    const ws = new WebSocket(process.env.REACT_APP_WS_URL || 'ws://35.202.92.164:8080/ws');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'incomingCall':
          notification.info({
            message: 'Incoming Call',
            description: `Call from ${data.phoneNumber}`,
            icon: <PhoneOutlined style={{ color: '#52c41a' }} />,
            duration: 0,
            key: `call-${data.callId}`,
            placement: 'topRight',
          });
          break;

        case 'missedCall':
          notification.warning({
            message: 'Missed Call',
            description: `Missed call from ${data.phoneNumber}`,
            icon: <PhoneOutlined style={{ color: '#faad14' }} />,
            duration: 4,
            key: `missed-${data.callId}`,
            placement: 'topRight',
          });
          break;

        case 'voicemail':
          notification.info({
            message: 'New Voicemail',
            description: `New voicemail from ${data.phoneNumber}`,
            icon: <MessageOutlined style={{ color: '#1890ff' }} />,
            duration: 4,
            key: `voicemail-${data.messageId}`,
            placement: 'topRight',
          });
          break;

        case 'error':
          notification.error({
            message: 'System Error',
            description: data.message,
            icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
            duration: 4,
            key: `error-${Date.now()}`,
            placement: 'topRight',
          });
          break;

        case 'statusUpdate':
          notification.info({
            message: 'Status Update',
            description: data.message,
            duration: 3,
            key: `status-${Date.now()}`,
            placement: 'topRight',
          });
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      notification.error({
        message: 'Connection Error',
        description: 'Lost connection to notification system. Please refresh the page.',
        duration: 0,
        key: 'ws-error',
        placement: 'topRight',
      });
    };

    // Clean up WebSocket connection
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default NotificationSystem; 