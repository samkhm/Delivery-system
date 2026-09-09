import { useEffect, useState } from "react";
import { getFirstName, getLastName, getUserId } from "@/utils/auth";
import Navbar from "./components/Navbar";
import { startSocket, stopSocket } from "@/services/socket";
import API from "@/services/api";
import DeliveryItem from "./components/DeliveryItem";

export default function RiderDashboard() {
  const firstName = getFirstName() || "";
  const lastName = getLastName() || "";

  const formattedFName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  const formattedLName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
  const riderId = getUserId();

  const [connected, setConnected] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all deliveries, we will filter client-side to only show this rider's assignments
      const deliveriesRes = await API.get(`/tasks/delivery/${riderId}/assigned`);
      const deliveriesData = deliveriesRes.data?.assignedDeliveries || [];          
      
      // Filter to only show deliveries assigned to THIS rider
      const myDeliveries = deliveriesData.filter(d => d.rider_id === riderId);

      setDeliveries(myDeliveries);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = startSocket();
    setConnected(socket.connected);

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    // Real-time updates
  const handleDeliveryAssigned = (payload) => {
    const { delivery: assignedDelivery } = payload;

    console.log("Delivery assigned event received:", assignedDelivery);

    const assignedRiderId =
        typeof assignedDelivery.rider_id === "object"
            ? assignedDelivery.rider_id?._id
            : assignedDelivery.rider_id;

    // Only update if this delivery belongs to this rider
    if (String(assignedRiderId) !== String(riderId)) {
        return;
    }

    setDeliveries((prev) => {
        const exists = prev.some(
            (d) => String(d._id) === String(assignedDelivery._id)
        );

        if (exists) {
            return prev.map((d) =>
                String(d._id) === String(assignedDelivery._id)
                    ? assignedDelivery
                    : d
            );
        }

        // New assignment → ADD it
        return [...prev, assignedDelivery];
    });
};

  const handleDeliveryUpdated = (payload) => {
    const { delivery: updatedDelivery } = payload;

    console.log("Delivery updated:", updatedDelivery);

    const assignedRiderId =
        updatedDelivery.rider_id?._id ||
        updatedDelivery.rider_id;

    // Delivery no longer belongs to this rider
    if (
        !assignedRiderId ||
        assignedRiderId.toString() !== riderId.toString()
    ) {
        setDeliveries((prev) =>
            prev.filter(
                (item) => item._id !== updatedDelivery._id
            )
        );

        return;
    }

    // Update existing delivery
    setDeliveries((prev) =>
        prev.map((item) =>
            item._id === updatedDelivery._id
                ? updatedDelivery
                : item
        )
    );
};
    
    const handleDeliveryDeleted = (payload) => {
      const { delivery: deletedDelivery } = payload;
      setDeliveries((prev) => prev.filter((d) => d._id !== deletedDelivery._id));
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("delivery_assigned", handleDeliveryAssigned);
    socket.on("delivery_updated", handleDeliveryUpdated);
    socket.on("delivery_deleted", handleDeliveryDeleted);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("delivery_assigned", handleDeliveryAssigned);
      socket.off("delivery_updated", handleDeliveryUpdated);
      socket.off("delivery_deleted", handleDeliveryDeleted);
      stopSocket();
    };
  }, [riderId]);

  // --- Rider Actions ---

 const handleAcceptDelivery = async (deliveryId) => {
    try {
        const res = await API.patch(
            `/tasks/delivery/${deliveryId}/accept`
        );

        console.log("Delivery accepted:", res.data);
    } catch (error) {
        console.error(
            "Failed to accept delivery:",
            error.response?.data || error
        );

        throw error;
    }
};

const handleRejectDelivery = async (deliveryId) => {
    try {
        const res = await API.patch(
            `/tasks/delivery/${deliveryId}/reject`
        );

        console.log("Delivery rejected:", res.data);
    } catch (error) {
        console.error(
            "Failed to reject delivery:",
            error.response?.data || error
        );

        throw error;
    }
};

  const handleUpdateStatus = async (deliveryId, newStatus, locationNote = "") => {
    try {
      await API.patch(`/tasks/delivery/${deliveryId}/status`, {
        status: newStatus,
        location: locationNote,
      });
      
      // Optimistic update
      setDeliveries((prev) =>
        prev.map((d) =>
          d._id === deliveryId ? { ...d, status: newStatus, location_note: locationNote } : d
        )
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      throw error;
    }
  };

  // Filter active vs completed for better UI (optional but recommended)
  const activeDeliveries = deliveries.filter(d => !['delivered', 'rejected', 'failed'].includes(d.status?.toLowerCase()));
  const completedDeliveries = deliveries.filter(d => ['delivered', 'rejected', 'failed'].includes(d.status?.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        formattedFName={formattedFName}
        formattedLName={formattedLName}
        connected={connected}
        role="Rider"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Rider Dashboard
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              View, accept, and update the status of your assigned deliveries.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Active Deliveries Section */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Active Deliveries</h3>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {loading ? "..." : `${activeDeliveries.length} active`}
              </span>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="w-full p-4 bg-white border border-slate-200 rounded-xl animate-pulse">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="h-5 w-1/3 bg-slate-200 rounded-md"></div>
                          <div className="h-4 w-1/4 bg-slate-200 rounded-md"></div>
                        </div>
                        <div className="h-9 w-32 bg-slate-200 rounded-lg"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeDeliveries.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {activeDeliveries.map((delivery) => (
                    <DeliveryItem
                      key={delivery._id}
                      delivery={delivery}
                      onAccept={() => handleAcceptDelivery(delivery._id)}
                      onReject={() => handleRejectDelivery(delivery._id)}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h4 className="text-base font-semibold text-slate-900">No active deliveries</h4>
                  <p className="text-sm text-slate-500 mt-2 max-w-sm">
                    You currently have no assigned deliveries. Check back later or contact your dispatcher.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Completed Deliveries Section (Collapsible or just listed below) */}
          {completedDeliveries.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm opacity-75">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Completed / Rejected</h3>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {completedDeliveries.length} total
                </span>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-3">
                  {completedDeliveries.map((delivery) => (
                    <DeliveryItem
                      key={delivery._id}
                      delivery={delivery}
                      onAccept={() => {}}
                      onReject={() => {}}
                      onUpdateStatus={() => {}}
                      isReadOnly={true}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}