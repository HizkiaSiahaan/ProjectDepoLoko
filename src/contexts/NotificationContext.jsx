import React, { createContext, useContext, useState } from 'react';

const initialNotifications = [
  { waktu: 'Segera', pesan: 'COMING SOON', status: 'Belum Dibaca' },
];

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const addNotification = (notif) => {
    setNotifications((prev) => [{ ...notif, status: 'Belum Dibaca' }, ...prev]);
  };

  const markAsRead = (idxOrId) => {
    setNotifications((prev) =>
      prev.map((n, i) => (n.id === idxOrId || i === idxOrId ? { ...n, status: 'Dibaca' } : n))
    );
  };

  // Remove by id or index
  const removeNotification = (idxOrId) => {
    setNotifications((prev) => prev.filter((n, i) => n.id !== idxOrId && i !== idxOrId));
  };

  // Lookup notification by scheduleId
  const getNotificationByScheduleId = (scheduleId) =>
    notifications.find((n) => n.scheduleId === scheduleId);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, removeNotification, getNotificationByScheduleId }}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  return useContext(NotificationContext);
}
