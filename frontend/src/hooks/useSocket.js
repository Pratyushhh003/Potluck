import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL = "http://localhost:4004";

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    socketRef.current = io(SOCKET_URL);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("register", user.id);
      console.log("Socket connected");
    });

    socketRef.current.on("notification", (data) => {
      if (data.type === "new_order") {
        toast.success(data.message, { duration: 5000, icon: "🍱" });
      } else if (data.type === "order_update") {
        toast(data.message, { duration: 4000, icon: "📦" });
      } else {
        toast(data.message, { duration: 3000 });
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user]);

  return socketRef.current;
};
