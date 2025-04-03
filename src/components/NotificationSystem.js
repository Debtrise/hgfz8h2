import React, { useState, useEffect, useRef } from "react";
import { Card, Space, Avatar, Typography, Button } from "antd";
import {
  LikeOutlined,
  FireOutlined,
  HeartOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    agentName: "Sarah Johnson",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
    dealAmount: "$4,275",
    timestamp: new Date().getTime() - 1000 * 60 * 5, // 5 minutes ago
    product: "Premier Loan Package",
    reactions: [
      { type: "fire", count: 3 },
      { type: "heart", count: 1 },
    ],
  },
  {
    id: 2,
    agentName: "Michael Chen",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
    dealAmount: "$6,150",
    timestamp: new Date().getTime() - 1000 * 60 * 15, // 15 minutes ago
    product: "Home Equity Line",
    reactions: [
      { type: "thumbs-up", count: 5 },
      { type: "heart", count: 2 },
    ],
  },
  {
    id: 3,
    agentName: "Emma Rodriguez",
    avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
    dealAmount: "$3,890",
    timestamp: new Date().getTime() - 1000 * 60 * 32, // 32 minutes ago
    product: "Auto Refinance",
    reactions: [
      { type: "fire", count: 7 },
      { type: "heart", count: 3 },
      { type: "thumbs-up", count: 2 },
    ],
  },
];

// Localized confetti component that only shows confetti around the notification
const LocalizedConfetti = ({ id }) => {
  const confettiPieces = Array(30).fill(null);

  return (
    <div
      style={{
        position: "absolute",
        top: -20,
        left: -20,
        width: 340, // 300px card + 20px on each side
        height: 200,
        pointerEvents: "none",
        zIndex: 999,
        overflow: "hidden",
      }}
    >
      {confettiPieces.map((_, index) => {
        const size = Math.random() * 3 + 4;
        const color = [
          "#f44336",
          "#e91e63",
          "#9c27b0",
          "#673ab7",
          "#3f51b5",
          "#2196f3",
          "#03a9f4",
          "#00bcd4",
          "#009688",
          "#4caf50",
          "#8bc34a",
          "#cddc39",
          "#ffeb3b",
          "#ffc107",
          "#ff9800",
          "#ff5722",
        ][Math.floor(Math.random() * 16)];
        const left = Math.random() * 340;
        const animationDuration = Math.random() * 2 + 1;
        const animationDelay = Math.random() * 0.5;

        // Randomize shape between circle and rectangle
        const isCircle = Math.random() > 0.5;
        const style = isCircle
          ? {
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: "50%",
            }
          : {
              width: `${size * 0.8}px`,
              height: `${size * 3}px`,
              borderRadius: "2px",
              transform: `rotate(${Math.random() * 90}deg)`,
            };

        return (
          <div
            key={`confetti-${id}-${index}`}
            style={{
              position: "absolute",
              backgroundColor: color,
              top: -size,
              left: left,
              ...style,
              animation: `fall-${id} ${animationDuration}s ${animationDelay}s ease-out forwards`,
            }}
          />
        );
      })}

      <style>{`
        @keyframes fall-${id} {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(200px) rotate(${Math.random() * 360}deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Component for the deal notification card
const DealNotification = ({
  notification,
  onReaction,
  onClose,
  showConfetti,
}) => {
  // Format time to show "x minutes ago" or similar
  const formatTimeAgo = (timestamp) => {
    const now = new Date().getTime();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) {
      return "Just now";
    }
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  };

  // Get the count for a specific reaction type
  const getReactionCount = (type) => {
    const reaction = notification.reactions.find((r) => r.type === type);
    return reaction ? reaction.count : 0;
  };

  return (
    <div style={{ position: "relative", marginBottom: "10px" }}>
      {showConfetti && <LocalizedConfetti id={notification.id} />}
      <Card
        style={{
          width: 300,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          borderRadius: "8px",
          border: showConfetti ? "1px solid #ffeb3b" : "1px solid #f0f0f0",
          transition: "border-color 0.3s ease",
        }}
        bodyStyle={{ padding: "12px" }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <Avatar src={notification.avatar} />
          <div style={{ marginLeft: 8 }}>
            <Text strong>{notification.agentName}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {formatTimeAgo(notification.timestamp)}
              </Text>
            </div>
          </div>
          <Button
            type="text"
            icon={<CloseCircleOutlined />}
            size="small"
            style={{ marginLeft: "auto" }}
            onClick={() => onClose(notification.id)}
          />
        </div>

        <div style={{ margin: "8px 0" }}>
          <Space>
            <TrophyOutlined style={{ color: "#faad14", fontSize: "16px" }} />
            <Text>Closed a deal for</Text>
            <Text strong style={{ color: "#52c41a" }}>
              {notification.dealAmount}
            </Text>
          </Space>
          <div>
            <Text type="secondary">{notification.product}</Text>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid #f0f0f0",
            paddingTop: 8,
          }}
        >
          <Button
            size="small"
            icon={<LikeOutlined />}
            onClick={() => onReaction(notification.id, "thumbs-up")}
          >
            {getReactionCount("thumbs-up") > 0 && getReactionCount("thumbs-up")}
          </Button>
          <Button
            size="small"
            icon={<FireOutlined />}
            style={{
              color: getReactionCount("fire") > 0 ? "#fa541c" : undefined,
            }}
            onClick={() => onReaction(notification.id, "fire")}
          >
            {getReactionCount("fire") > 0 && getReactionCount("fire")}
          </Button>
          <Button
            size="small"
            icon={<HeartOutlined />}
            style={{
              color: getReactionCount("heart") > 0 ? "#f5222d" : undefined,
            }}
            onClick={() => onReaction(notification.id, "heart")}
          >
            {getReactionCount("heart") > 0 && getReactionCount("heart")}
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Main Notification System component
const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [newNotificationId, setNewNotificationId] = useState(null);
  const timeoutsRef = useRef([]);

  // Clear all timeouts when component unmounts
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, []);

  // Set up auto-close timeout for a notification
  const setupAutoClose = (notificationId) => {
    const timeoutId = setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    }, 7000); // Auto-close after 5 seconds

    // Store timeout ID for cleanup
    timeoutsRef.current.push(timeoutId);
    return timeoutId;
  };

  // Mock receiving a new notification
  useEffect(() => {
    // Initial delay before starting notifications
    const initialTimeout = setTimeout(() => {
      const initialNotifications = mockNotifications.slice(0, 2);
      setNotifications(initialNotifications);

      // Set up auto-close for each initial notification
      initialNotifications.forEach((notification) => {
        setupAutoClose(notification.id);
      });
    }, 1000);

    // Regular interval to add new notifications
    const interval = setInterval(() => {
      // Generate a new random notification
      const newNotification = {
        id: Date.now(),
        agentName: ["Alex Thompson", "Jamie Lee", "Taylor Singh", "Riley Kim"][
          Math.floor(Math.random() * 4)
        ],
        avatar: `https://xsgames.co/randomusers/avatar.php?g=${
          Math.random() > 0.5 ? "male" : "female"
        }`,
        dealAmount: `$${(
          Math.floor(Math.random() * 10000) + 1000
        ).toLocaleString()}`,
        timestamp: new Date().getTime(),
        product: [
          "Home Mortgage",
          "Auto Loan",
          "Personal Loan",
          "Refinance",
          "Credit Line",
        ][Math.floor(Math.random() * 5)],
        reactions: [],
      };

      // Add the notification and trigger confetti
      setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]); // Keep max 5 notifications
      setNewNotificationId(newNotification.id);

      // Set up auto-close for the new notification
      setupAutoClose(newNotification.id);

      // Clear the confetti effect after 3 seconds
      setTimeout(() => {
        setNewNotificationId(null);
      }, 3000);
    }, 15000); // Every 15 seconds

    timeoutsRef.current.push(initialTimeout);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, []);

  // Handle reactions to notifications
  const handleReaction = (notificationId, reactionType) => {
    setNotifications((prev) =>
      prev.map((notification) => {
        if (notification.id === notificationId) {
          const updatedReactions = [...notification.reactions];
          const existingReaction = updatedReactions.findIndex(
            (r) => r.type === reactionType
          );

          if (existingReaction >= 0) {
            updatedReactions[existingReaction].count += 1;
          } else {
            updatedReactions.push({ type: reactionType, count: 1 });
          }

          return { ...notification, reactions: updatedReactions };
        }
        return notification;
      })
    );
  };

  // Close/dismiss a notification
  const handleCloseNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
      {/* Notifications stack */}
      <div style={{ display: "flex", flexDirection: "column-reverse" }}>
        {notifications.slice(0, 3).map((notification) => (
          <DealNotification
            key={notification.id}
            notification={notification}
            onReaction={handleReaction}
            onClose={handleCloseNotification}
            showConfetti={notification.id === newNotificationId}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationSystem;
