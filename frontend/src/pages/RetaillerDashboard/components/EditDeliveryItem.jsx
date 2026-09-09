import React, { useState, useEffect } from "react";
// import API from "../../../services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import API from "@/services/api";

export default function EditDelivery({ open, onOpenChange, setDeliveries, delivery }) {
  const formatPhoneForInput = (phone) => {
    if (!phone) return "";
    if (phone.startsWith("254")) return `0${phone.slice(3)}`;
    return phone;
  };

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [itemDescription, setItemDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Reset and populate form whenever the dialog opens
  useEffect(() => {
    if (open && delivery) {
      setCustomerName(delivery.customer_name || "");
      setCustomerPhone(formatPhoneForInput(delivery.customer_phone) || "");
      setCustomerAddress(delivery.customer_address || "");
      setItemDescription(delivery.item_description || "");
      setMessage("");
      setErrors({});
    }
  }, [open, delivery]);

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
    if (!values.customerName) newErrors.customerName = "Customer name is required";
    if (!values.customerPhone) newErrors.customerPhone = "Phone number is required";
    if (!values.customerAddress) newErrors.customerAddress = "Delivery address is required";
    if (!values.itemDescription) newErrors.itemDescription = "Item description is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage("Please fill in all required fields");
      setMessageType("error");
      return;
    }

    if (!nameRegex.test(values.customerName)) newErrors.customerName = "Only letters and spaces are allowed";
    if (values.customerPhone.startsWith("254")) {
      newErrors.customerPhone = "Use 07XXXXXXXX or 01XXXXXXXX";
    } else if (!phoneRegex.test(values.customerPhone)) {
      newErrors.customerPhone = "Invalid phone number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage("Please correct the errors");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        customer_name: values.customerName,
        customer_phone: `254${values.customerPhone.slice(1)}`,
        customer_address: values.customerAddress,
        item_description: values.itemDescription,
      };

      const res = await API.put(`/tasks/delivery/update/${delivery._id}`, payload);     
      

      setDeliveries((prev) =>
        prev.map((item) => (item._id === delivery._id ? res.data.delivery : item))
      );

      setMessage("Delivery updated successfully!");
      setMessageType("success");

      // Brief delay so the user sees the success message before it closes
      setTimeout(() => {
        onOpenChange(false);
      }, 1200);

    } catch (error) {      
      setMessage(error.response?.data?.message || "Failed to update delivery");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Edit delivery information</DialogTitle>
          <p className="text-sm text-slate-500 mt-1">Update the delivery details below.</p>
        </DialogHeader>

        {message && (
          <div className={`mt-2 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
            messageType === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {messageType === "success" && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            )}
            {message}
          </div>
        )}

        <form className="space-y-4 mt-2" onSubmit={handleSave}>
          <FormField label="Customer name" name="customerName" value={customerName} onChange={setCustomerName} error={errors.customerName} placeholder="Moses Juma" />
          <FormField label="Customer phone" name="customerPhone" value={customerPhone} onChange={setCustomerPhone} error={errors.customerPhone} placeholder="0745xxxxxx" type="tel" />
          <FormField label="Delivery address" name="customerAddress" value={customerAddress} onChange={setCustomerAddress} error={errors.customerAddress} placeholder="House No., Building, Town" />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Item description</label>
            <textarea
              rows={3}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition resize-none ${
                errors.itemDescription ? "border-red-300 focus:ring-red-200 focus:border-red-500" : "border-slate-200 focus:ring-indigo-200 focus:border-indigo-500"
              }`}
              value={itemDescription}
              onChange={(e) => {
                setItemDescription(e.target.value);
                if (errors.itemDescription) setErrors((p) => ({ ...p, itemDescription: "" }));
              }}
              placeholder="Brief description of the item(s) being delivered"
            />
            {errors.itemDescription && <p className="mt-1 text-xs text-red-500">{errors.itemDescription}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <DialogClose asChild>
              <button type="button" className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition">
                Cancel
              </button>
            </DialogClose>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Reusable Form Field to keep code DRY
function FormField({ label, name, value, onChange, error, placeholder, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${
          error ? "border-red-300 focus:ring-red-200 focus:border-red-500" : "border-slate-200 focus:ring-indigo-200 focus:border-indigo-500"
        }`}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (error) setErrors((p) => ({ ...p, [name]: "" }));
        }}
        placeholder={placeholder}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}