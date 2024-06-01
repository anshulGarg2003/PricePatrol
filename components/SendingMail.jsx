// components/SendMailButton.js
"use client";

import { cronProduct } from "@/lib/actions";

const SendMailButton = () => {
  const handleSendingMail = () => {
    cronProduct();
  };
  return <button className="flex justify-center bottom-5 p-3 align-middle" onClick={handleSendingMail}>Send Mail</button>;
};

export default SendMailButton;
