"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4500}
      hideProgressBar
      closeOnClick
      pauseOnHover
      draggable={false}
      toastClassName="rounded-brand-md border border-border bg-card text-card-foreground shadow-ring"
    />
  );
}
