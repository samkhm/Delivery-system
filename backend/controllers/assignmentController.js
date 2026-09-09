const AssignedDelivery = require("../models/AssignedDelivery");
const Delivery = require("../models/Delivery");
const User = require("../models/User");

const { notifyRetailer, notifyDispatcher, notifyRider } = require("../services/socketService")

exports.assignRiderToDelivery = async (req, res) => {
    try {
        
        const { deliveryId } = req.params;
        const { rider_id, dispatcher_id } = req.body;

        // Validate input
        if (!rider_id) {
            return res.status(400).json({
                message: "Rider ID is required"
            });
        }

        if (!dispatcher_id) {
            return res.status(400).json({
                message: "Dispatcher ID is required"
            });
        }

        // Check delivery
        const delivery = await Delivery.findById(deliveryId);

        if (!delivery) {
            return res.status(404).json({
                message: "Delivery not found"
            });
        }

        // Check rider
        const rider = await User.findById(rider_id);

        if (!rider) {
            return res.status(404).json({
                message: "Rider not found"
            });
        }

        // Check rider availability
        if (rider.status !== "available") {
            return res.status(400).json({
                message: "Rider is not available"
            });
        }

        // Create assignment document
        const assignedDelivery = await AssignedDelivery.create({
            delivery_id: deliveryId,
            dispatcher_id: dispatcher_id,
            rider_id: rider_id
        });

        delivery.rider_id = rider_id;
        delivery.dispatcher_id = dispatcher_id;
        delivery.status = "assigned";
        await delivery.save();

        // notifyRider that they have been assigned a delivery
        notifyRider("delivery_assigned", { delivery });
        console.log("Notification sent to rider:", rider_id, "for delivery:", deliveryId);

        // Update delivery status
        delivery.status = "assigned";
        delivery.rider_id = rider_id;
        delivery.dispatcher_id = dispatcher_id;
        await delivery.save();

        // Update rider status
        rider.status = "unavailable";
        await rider.save();

        // notifyRetailer updated delivery status to assigned
        notifyRetailer("delivery_assigned", { delivery })

        //notifyDispatcher rider status updated to unavailable
        notifyDispatcher("rider_status_updated", {  rider_id: rider._id, status: rider.status })
        console.log("Rider status updated:", rider)
     

        return res.status(200).json({
            message: "Rider assigned to delivery successfully",
            data: assignedDelivery,            
        });


    } catch (error) {
        console.error("Error assigning rider to delivery:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

exports.getAssignedDeliveries = async (req, res) => {
    try {
        const assignedDeliveries = await AssignedDelivery.find()
            .populate("delivery_id")
            .populate("rider_id")
            .populate("dispatcher_id");
        return res.json({ assignedDeliveries });
    } catch (error) {
        console.error("Error fetching assigned deliveries:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// rider gets personal assigned deliveries
exports.getRiderAssignedDeliveries = async (req, res) => {
    try {
        const { riderId } = req.params;
        const assignedDeliveries = await Delivery.find({ rider_id: riderId })            
            .populate("dispatcher_id");

        return res.json({ assignedDeliveries });
    } catch (error) {
        console.error("Error fetching assigned deliveries for rider:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
