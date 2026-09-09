import React from "react";
import API from "../../../services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useEffect } from "react";
import { getUserId } from "@/utils/auth";

export default function AddDelivery({ setDeliveries }) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [itemDescription, setItemDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

 const handleSave = async (e) => {
  e.preventDefault();

  setErrors({});
  setMessage("");
  setMessageType("");

  const nameRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
  const phoneRegex = /^(07|01)\d{8}$/;

  const values = {
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    customerAddress: customerAddress.trim(),
    itemDescription: itemDescription.trim(),
  };

  const newErrors = {};

  // Required fields
  if (!values.customerName) {
    newErrors.customerName = "Customer name is required";
  }

  if (!values.customerPhone) {
    newErrors.customerPhone = "Phone number is required";
  }

  if (!values.customerAddress) {
    newErrors.customerAddress = "Delivery address is required";
  }

  if (!values.itemDescription) {
    newErrors.itemDescription = "Item description is required";
  }

  // Stop if required fields are missing
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    setMessage("Please fill in all required fields");
    setMessageType("error");
    return;
  }

  // Validate name
  if (!nameRegex.test(values.customerName)) {
    newErrors.customerName = "Only letters and spaces are allowed";
  }

  // Validate phone
  if (values.customerPhone.startsWith("254")) {
    newErrors.customerPhone = "Use 07XXXXXXXX or 01XXXXXXXX";
  } else if (!phoneRegex.test(values.customerPhone)) {
    newErrors.customerPhone = "Invalid phone number";
  }

  // Stop if validation failed
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    setMessage("Please correct the errors");
    setMessageType("error");
    return;
  }

  const userId = getUserId();

  try {
    setLoading(true);

    const payload = {
      customerName: values.customerName,
      phone: `254${values.customerPhone.slice(1)}`,
      address: values.customerAddress,
      itemDescription: values.itemDescription,
      retailerId: userId,
    };

    const res = await API.post("/tasks/delivery", payload);

    const newDelivery = res.data?.delivery ;

    setDeliveries((prev) => [newDelivery, ...prev]);

    setMessage(
       res.data.success || 
      "Delivery saved successfully!");
    setMessageType("success");

    // Clear form
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setItemDescription("");

  } catch (error) {
    setMessage(
      error.response?.data?.message || "Failed to save delivery"
    );
    setMessageType("error");

  } finally {
    setLoading(false);
  }
};

    useEffect(() => {
      if (message) {
        const timer = setTimeout(() => {
          setMessage("");
          setMessageType("");
          setErrors({});
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [message], [messageType], [errors]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add delivery
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Add delivery information
          </DialogTitle>
          <p className="text-sm text-slate-500 mt-1">
            Fill in the details below to create a new delivery.
          </p>
        </DialogHeader>

        {/* Message area */}
        {message && (
          <div
            className={`mt-4 px-4 py-2 flex items-center justify-center w-full rounded-lg text-sm ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {message}
          </div>
        )}

        <form className="space-y-4 mt-2" 
        onSubmit={handleSave} 
       >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Customer name
            </label>
            <input
              type="text"
              placeholder="Moses Juma"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 
              rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none
               focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
               value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (errors.customerName)
                    setErrors((p) => ({ ...p, customerName: "" }));
                }}
              />            
              <p className="mt-1 text-xs text-red-500">{errors.customerName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Customer phone
            </label>
            <input
              type="tel"
              placeholder="0745xxxxxx"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
               value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value);
                  if (errors.customerPhone)
                    setErrors((p) => ({ ...p, customerPhone: "" }));
                }}
           />

            <p className="mt-1 text-xs text-red-500">{errors.customerPhone}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Delivery address
            </label>
            <input
              type="text"
              placeholder="House No., Building, Town"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              value={customerAddress}
              onChange={(e) => {
                setCustomerAddress(e.target.value);
                if (errors.customerAddress)
                  setErrors((p) => ({ ...p, customerAddress: "" }));
              }}
            />
            <p className="mt-1 text-xs text-red-500">{errors.customerAddress}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Item description
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of the item(s) being delivered"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
              value={itemDescription}
              onChange={(e) => {
                setItemDescription(e.target.value);
                if (errors.itemDescription)
                  setErrors((p) => ({ ...p, itemDescription: "" }));
              }}
            />
            <p className="mt-1 text-xs text-red-500">{errors.itemDescription}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <DialogClose asChild>
              <button
                type="button"
                className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition"
              >
                Cancel
              </button>
            </DialogClose>
            <button
            
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
