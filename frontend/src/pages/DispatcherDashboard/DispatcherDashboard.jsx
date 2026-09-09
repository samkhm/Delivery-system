import { useEffect, useState } from "react";
import { getFirstName, getLastName, getUserId } from "@/utils/auth";
import Navbar from "./components/Navbar";
import { startSocket, stopSocket } from "@/services/socket";
import API from "@/services/api";
import DeliveryItem from "./components/DeliveryItem";

export default function DispatcherDashboard() {
  const firstName = getFirstName() || "";
  const lastName = getLastName() || "";

  const formattedFName =
    firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  const formattedLName =
    lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();

  const [connected, setConnected] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ridersRes, deliveriesRes] = await Promise.all([
        API.get("/auth/riders"),
        API.get("/tasks/delivery"),
      ]);

      setRiders(ridersRes.data?.riders || []);
      setDeliveries(deliveriesRes.data?.deliveries || []);
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

    const handleDeliveryCreated = (payload) => {
      const { delivery: newDelivery, riders } = payload;

      console.log(
        "New delivery received plus available riders:",
        newDelivery,
        riders,
      );

      setDeliveries((prev) => {
        const exists = prev.some(
          (existingDelivery) => existingDelivery._id === newDelivery._id,
        );

        if (exists) return prev;

        return [...prev, newDelivery];
      });

      setRiders((prevRiders) => {
        const updatedRiders = riders.map((rider) => {
          const existingRider = prevRiders.find(
            (r) => r.rider_id === rider.rider_id,
          );

          return existingRider ? { ...existingRider, ...rider } : rider;
        });

        return updatedRiders;
      });
    };

    const handleDeliveryUpdated = (payload) => {
      const { delivery: updatedDelivery } = payload;

      console.log("Delivery updated via socket:", updatedDelivery);

      setDeliveries((prev) =>
        prev.map((item) =>
          item._id === updatedDelivery._id ? updatedDelivery : item,
        ),
      );
    };

    const handleRiderStatusUpdated = (updatedRider) => {
      console.log("Rider status updated:", updatedRider);

      setRiders((prev) =>
        prev.map((rider) =>
          rider.rider_id === updatedRider.rider_id
            ? { ...rider, ...updatedRider }
            : rider,
        ),
      );
    };

    const handleDeliveryDeleted = (deletedDelivery) => {
      setDeliveries((prev) =>
        prev.filter((delivery) => delivery._id !== deletedDelivery._id),
      );
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    socket.on("delivery_created", handleDeliveryCreated);
    socket.on("delivery_updated", handleDeliveryUpdated);
    socket.on("delivery_deleted", handleDeliveryDeleted);
    socket.on("rider_status_updated", handleRiderStatusUpdated);
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);

      socket.off("delivery_created", handleDeliveryCreated);
      socket.off("delivery_updated", handleDeliveryUpdated);
      socket.off("delivery_deleted", handleDeliveryDeleted);
      socket.off("rider_status_updated", handleRiderStatusUpdated);

      stopSocket();
    };
  }, []);

  const dispatcherId = getUserId();

  const handleAssignRider = async (deliveryId, riderId) => {
    try {
      const res = await API.post(`/tasks/delivery/${deliveryId}/assign`, {
        rider_id: riderId,
        dispatcher_id: dispatcherId,
      });

      console.log("Rider assigned successfully:", res.data);

      const selectedRider = riders.find((rider) => rider.rider_id === riderId);

      setDeliveries((prev) =>
        prev.map((delivery) =>
          delivery._id === deliveryId
            ? {
                ...delivery,
                rider_id: selectedRider,
                status: "assigned",
              }
            : delivery,
        ),
      );
    } catch (error) {
      console.error("Failed to assign rider:", error.response?.data || error);

      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        formattedFName={formattedFName}
        formattedLName={formattedLName}
        connected={connected}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Dispatcher Dashboard
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage, track, and assign deliveries to available riders.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">
              Active Deliveries
            </h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {loading ? "..." : `${deliveries.length} total`}
            </span>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-full p-4 bg-white border border-slate-200 rounded-xl animate-pulse"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="h-5 w-1/3 bg-slate-200 rounded-md"></div>
                        <div className="h-4 w-1/4 bg-slate-200 rounded-md"></div>
                        <div className="h-3 w-2/3 bg-slate-200 rounded-md"></div>
                      </div>
                      <div className="h-9 w-32 bg-slate-200 rounded-lg"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : deliveries.length > 0 ? (
              <div className="flex flex-col gap-3">
                {deliveries.map((delivery) => (
                  <DeliveryItem
                    key={delivery._id}
                    delivery={delivery}
                    riders={riders}
                    onAssignRider={handleAssignRider}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-7 h-7 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h4 className="text-base font-semibold text-slate-900">
                  No deliveries found
                </h4>
                <p className="text-sm text-slate-500 mt-2 max-w-sm">
                  All deliveries have been completed or none have been created
                  yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
