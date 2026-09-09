import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogClose 
} from "@/components/ui/dialog";

export default function DeliveryItem({ delivery, riders, onAssignRider }) {
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Filter only riders who are currently available or idle
  const availableRiders = riders.filter(r => 
    r.status?.toLowerCase() === 'available' || r.status?.toLowerCase() === 'idle'
  );

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedRiderId) return;
    
    setIsAssigning(true);
    try {
      await onAssignRider(delivery._id, selectedRiderId);
      setIsAssignOpen(false);
      setSelectedRiderId("");
    } catch (error) {
      console.error("Failed to assign rider", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("deliver")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s.includes("transit") || s.includes("assign")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (s.includes("pending") || s.includes("waiting")) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  return (
    <div className="group p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        
        {/* Delivery Info */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-slate-900 truncate">
              {delivery.customer_name || "Unknown Customer"}
            </h4>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(delivery.status)}`}>
              {delivery.status || "Pending"}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <span className="truncate">{delivery.customer_phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="truncate">{delivery.customer_address}</span>
            </div>
          </div>
          
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <p className="text-xs font-medium text-slate-700 mb-0.5">Item Description</p>
            <p className="text-sm text-slate-600">{delivery.item_description || "No description provided"}</p>
          </div>

          {/* Assigned Rider Badge */}
          {delivery.rider_id?.first_name && (
            <div className="inline-flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-indigo-700 bg-indigo-50 px-3.5 py-2 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>
                  Assigned to: <span className="font-semibold text-indigo-900">{delivery.rider_id.first_name} {delivery.rider_id.last_name || ""}</span>
                </span>
              </div>
              
              {delivery.rider_id?.phone && (
                <div className="flex items-center gap-1.5 pl-0 sm:pl-4 sm:border-l sm:border-indigo-200">
                  <svg className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-medium text-indigo-900">{delivery.rider_id.phone}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:items-end gap-2 min-w-[140px]">
          <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
            <DialogTrigger asChild>
              <button 
                className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors w-full sm:w-auto ${
                  delivery.rider_id 
                    ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/20"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                
                {availableRiders.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-indigo-500 rounded-full">
                    {availableRiders.length}
                  </span>
                )}
                
                {delivery.rider_id ? "Reassign Rider" : "Assign Rider"}
              </button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Assign Delivery</DialogTitle>
                <p className="text-sm text-slate-500 mt-1">Select an available rider for this delivery.</p>
              </DialogHeader>
              
              <form onSubmit={handleAssign} className="space-y-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Available Riders</label>
                  {availableRiders.length > 0 ? (
                    <select 
                      value={selectedRiderId}
                      onChange={(e) => setSelectedRiderId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      required
                    >
                      <option value="">Select a rider...</option>
                      {availableRiders.map(rider => (
                        <option key={rider.rider_id} value={rider.rider_id}>
                          {rider.first_name} {rider.last_name} ({rider.phone}) — {rider.vehicle_type || 'Standard Rider'}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 text-center">
                      No riders are currently available for assignment.
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <DialogClose asChild>
                    <button type="button" className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                      Cancel
                    </button>
                  </DialogClose>
                  <button 
                    type="submit" 
                    disabled={isAssigning || availableRiders.length === 0}
                    className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center gap-2"
                  >
                    {isAssigning ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        Assigning...
                      </>
                    ) : "Confirm Assignment"}
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}