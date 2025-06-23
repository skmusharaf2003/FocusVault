import { useEffect, useState } from "react";
import axios from "axios";

const useNewFeedbackStatus = () => {
  const [hasNew, setHasNew] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const checkNewFeedback = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/feedback/has-new`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setHasNew(res.data.hasNew);
      }
    } catch (err) {
      console.error("Error checking new feedback:", err.message);
    }
  };

  useEffect(() => {
    checkNewFeedback();
  }, []);

  return hasNew;
};

export default useNewFeedbackStatus;
