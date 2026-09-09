import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

export default function DeliveryItem({ delivery, onAccept, onReject, onUpdateStatus, isReadOnly = false }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationNote, setLocationNote] = useState(delivery.location_note || "");
  const [targetStatus, setTargetStatus] = useState("");

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || "";
    if (s === "delivered") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "in_transit" || s === "accepted" || s === "picked_up") return "bg-blue-50 text-blue-700 border-blue-200";
    if (s === "assigned" || s === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
    if (s === "rejected" || s === "failed") return "bg-red-50 text-red-700 border-red-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await onUpdateStatus(delivery._id, targetStatus, locationNote);
      setShowLocationModal(false);
      setLocationNote("");
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const openLocationModal = (status) => {
    setTargetStatus(status);
    setShowLocationModal(true);
  };

  return (
    <>
      <div className={`group p-4 bg-white border rounded-xl transition-all duration-200 ${isReadOnly ? 'border-slate-100 bg-slate-50/50' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}`}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          
          {/* Delivery Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-slate-900 truncate">
                {delivery.customer_name || "Unknown Customer"}
              </h4>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(delivery.status)}`}>
                {delivery.status?.replace('_', ' ').toUpperCase() || "ASSIGNED"}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="truncate">{delivery.customer_phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{delivery.customer_address}</span>
              </div>
            </div>
            
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <p className="text-xs font-medium text-slate-700 mb-0.5">Item Description</p>
              <p className="text-sm text-slate-600">{delivery.item_description || "No description provided"}</p>
            </div>

            {delivery.location_note && (
              <div className="flex items-start gap-2 text-xs text-slate-500 bg-blue-50 p-2 rounded-md border border-blue-100">
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>Location Note:</strong> {delivery.location_note}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          {!isReadOnly && (
            <div className="flex flex-col sm:items-end gap-2 min-w-[160px]">
              {delivery.status?.toLowerCase() === 'assigned' ? (
                <>
                  <button 
                    onClick={onAccept}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-500/20 transition-colors w-full sm:w-auto"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Accept
                  </button>
                  <button 
                    onClick={onReject}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-colors w-full sm:w-auto"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    Reject
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => openLocationModal('in_transit')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors w-full sm:w-auto"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Update Location
                  </button>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => openLocationModal('delivered')}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-500/20 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Delivered
                    </button>
                    <button 
                      onClick={() => openLocationModal('failed')}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-colors"
                      title="Mark as Failed/Undeliverable"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      Failed
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Location / Status Update Modal */}
      <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Delivery Status</DialogTitle>
            <p className="text-sm text-slate-500 mt-1">
              Mark as <span className="font-semibold text-slate-900 capitalize">{targetStatus.replace('_', ' ')}</span> and add a location note (optional).
            </p>
          </DialogHeader>
          
          <form onSubmit={handleStatusUpdate} className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Location / Note</label>
              <textarea
                rows={3}
                value={locationNote}
                onChange={(e) => setLocationNote(e.target.value)}
                placeholder="e.g., Arrived at customer doorstep, Building B, 3rd Floor..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <DialogClose asChild>
                <button type="button" className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  Cancel
                </button>
              </DialogClose>
              <button 
                type="submit" 
                disabled={isUpdating}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Updating...
                  </>
                ) : "Confirm Update"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}