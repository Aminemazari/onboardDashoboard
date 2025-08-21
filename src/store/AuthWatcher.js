"use client"
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkAuth, logout } from "../store/authSlice";

export default function AuthWatcher({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check token validity on mount
    const auth = JSON.parse(localStorage.getItem("persist:root"));
    if (auth && auth.auth) {
      try {
        const { token, admin } = JSON.parse(auth.auth);
        if (token) {
          const parsed = JSON.parse(token);
          if (parsed.expires && Date.now() > parsed.expires) {
            dispatch(logout());
          } else {
            dispatch(checkAuth({ isAuthenticated: true, token, admin }));
          }
        }
      } catch {
        dispatch(logout());
      }
    }
  }, [dispatch]);

  return children;
}
