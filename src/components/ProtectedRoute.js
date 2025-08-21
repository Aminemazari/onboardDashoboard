"use client";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { logout } from "../store/authSlice";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      dispatch(logout());
      router.replace("/admin");
      return;
    }
    try {
      const parsed = JSON.parse(token);
      if (!parsed.value || !parsed.expires || Date.now() > parsed.expires) {
        dispatch(logout());
        router.replace("/admin");
      }
    } catch {
      dispatch(logout());
      router.replace("/admin");
    }
  }, [token, dispatch, router]);

  if (!isAuthenticated) return null;
  return children;
}
