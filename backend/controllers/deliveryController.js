const Delivery = require("../models/Delivery");
const User = require("../models/User");
const { notifyDispatcher, notifyRider, notifyRetailer } = require("../services/socketService")

exports.createDelivery = async (req, res) => {
        
    try {

        const { customerName, phone, address, itemDescription, retailerId } = req.body;

        if ( !customerName || !phone || !address || !itemDescription || !retailerId ) {
            return res.status(400).json({ message: "All fields are required!"})
        }

        const cleanDelivery = {
            customer_name: customerName.trim().toLowerCase(),
            customer_phone: phone.trim().toLowerCase(),
            customer_address: address.trim().toLowerCase(),
            item_description: itemDescription.trim().toLowerCase(),
            retailer_id: retailerId.trim().toLowerCase(),
        }

        const deliveryItem = await Delivery.create(cleanDelivery)

        //get available riders
        const availableRiders = await User.find({ role: 'rider', status: 'available' }).select('-password');
             const formattedRiders = availableRiders.map(rider => ({
            rider_id: rider._id,
            first_name: rider.first_name,
            last_name: rider.last_name,
            email: rider.email,
            phone: rider.phone,
            status: rider.status
        }));
        const payload = {
            delivery: deliveryItem,
            riders: formattedRiders
        }

        notifyDispatcher("delivery_created", payload)

        

        return res.status(201).json({
            message: "Created!",
            delivery: deliveryItem
        })
                
    } catch (error) {
           
        return res.status(500).json({ message : "Server error!"})    
    }
}


exports.getDelivery = async (req, res) => {
    try {
        const deliveries = await Delivery.find()
        .populate("retailer_id", "first_name last_name phone")
        .populate("dispatcher_id", "first_name last_name phone")
        .populate("rider_id", "first_name last_name phone");

        if (!deliveries) return res.json({ message: "No deliveries"})
            
            

            return res.json({ deliveries })                
    } catch (error) {
        return res.status(500).json({ message : "Server error"})        
    }
}


exports.updateDelivery = async (req, res) => {
    try {
        const { id } = req.params;
      const { customer_name, customer_phone, customer_address, item_description } = req.body;

        if ( !customer_name || !customer_phone || !customer_address || !item_description ) {
            return res.status(400).json({ message: "All fields are required!"})
        }

        const cleanDelivery = {
            customer_name: customer_name.trim().toLowerCase(),
            customer_phone: customer_phone.trim().toLowerCase(),
            customer_address: customer_address.trim().toLowerCase(),
            item_description: item_description.trim().toLowerCase(),
        }
        const delivery = await Delivery.findByIdAndUpdate(
            id, 
            { customer_name: cleanDelivery.customer_name,
                customer_phone: cleanDelivery.customer_phone,
                customer_address: cleanDelivery.customer_address,
                item_description: cleanDelivery.item_description,
            },
            { new: true, runValidators: true}
        )
        .populate("retailer_id", "first_name last_name phone")
        .populate("dispatcher_id", "first_name last_name phone")
        .populate("rider_id", "first_name last_name phone");

        
        notifyDispatcher("delivery_updated", {
            delivery
        })
        notifyRider("delivery_updated", {
            delivery
        })

       
        

        return res.status(200).json({
            message: "Updated!",
            delivery
        })
                
    } catch (error) {
        return res.status(500).json({ message : "Server error"})        
    }
}


exports.deleteDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        const delivery = await Delivery.findById(id);
        if (!delivery){
            return res.status(404).json({
                message: "Not found!"
            })
        }

        await Delivery.findByIdAndDelete(id);

        notifyDispatcher("delivery_deleted", delivery)
        notifyRider("delivery_deleted", delivery)

        return res.json({
            message: "Deleted!"
        })
                
    } catch (error) {
        return res.status(500).json({ message : "Server error"})        
    }
}




//Rider

exports.acceptDelivery = async (req, res) => {
    try {
        const { deliveryId } = req.params;

        // The authenticated rider
        const riderId = req.user.id;

        const delivery = await Delivery.findById(deliveryId);

        if (!delivery) {
            return res.status(404).json({
                message: "Delivery not found"
            });
        }

        // Make sure this delivery belongs to this rider
        if (!delivery.rider_id) {
            return res.status(400).json({
                message: "This delivery is not assigned to any rider"
            });
        }

        if (delivery.rider_id.toString() !== riderId.toString()) {
            return res.status(403).json({
                message: "This delivery is not assigned to you"
            });
        }

        // Only assigned deliveries can be accepted
        if (delivery.status !== "assigned") {
            return res.status(400).json({
                message: `Delivery cannot be accepted because its status is "${delivery.status}"`
            });
        }

        // Update delivery
        delivery.status = "in_transit";

        await delivery.save();

        // Make rider busy
        await User.findByIdAndUpdate(
            riderId,
            {
                status: "busy"
            },
            {
                new: true
            }
        );

        // Populate before sending through Socket.IO
        await delivery.populate([
            {
                path: "retailer_id",
                select: "first_name last_name phone"
            },
            {
                path: "dispatcher_id",
                select: "first_name last_name phone"
            },
            {
                path: "rider_id",
                select: "first_name last_name phone status"
            }
        ]);

        // Notify dispatcher
        notifyDispatcher("delivery_updated", {
            delivery
        });

        // Notify retailer
        notifyRetailer("delivery_updated", {
            delivery
        });

        // Notify this rider
        notifyRider("delivery_updated", {
            delivery
        });

        return res.status(200).json({
            message: "Delivery accepted",
            delivery
        });

    } catch (error) {
        console.error("Error accepting delivery:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


exports.rejectDelivery = async (req, res) => {
    try {
        const { deliveryId } = req.params;

        // Authenticated rider
        const riderId = req.user.id;

        const delivery = await Delivery.findById(deliveryId);

        if (!delivery) {
            return res.status(404).json({
                message: "Delivery not found"
            });
        }

        // Make sure it has a rider
        if (!delivery.rider_id) {
            return res.status(400).json({
                message: "This delivery is not assigned to any rider"
            });
        }

        // Make sure this rider owns the assignment
        if (delivery.rider_id.toString() !== riderId.toString()) {
            return res.status(403).json({
                message: "This delivery is not assigned to you"
            });
        }

        // Only assigned deliveries can be rejected
        if (delivery.status !== "assigned") {
            return res.status(400).json({
                message: `Delivery cannot be rejected because its status is "${delivery.status}"`
            });
        }

        // Remove rider and make delivery available again
        delivery.rider_id = null;
        delivery.status = "waiting";

        await delivery.save();

        // Make rider available again
        await User.findByIdAndUpdate(
            riderId,
            {
                status: "available"
            }
        );

        // Populate the remaining references
        await delivery.populate([
            {
                path: "retailer_id",
                select: "first_name last_name phone"
            },
            {
                path: "dispatcher_id",
                select: "first_name last_name phone"
            }
        ]);

        // Tell dispatcher that the assignment was rejected
        notifyDispatcher("delivery_updated", {
            delivery
        });

        // Tell retailer
        notifyRetailer("delivery_updated", {
            delivery
        });

        // Tell the rider
        notifyRider("delivery_updated", {
            delivery
        });

        return res.status(200).json({
            message: "Delivery rejected",
            delivery
        });

    } catch (error) {
        console.error("Error rejecting delivery:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};



exports.updateDeliveryStatus = async (req, res) => {
    console.log("updateDeliveryStatus called with params:", req.params, "and body:", req.body);
    try {
        const { deliveryId } = req.params;
        const { status, location } = req.body;

        // Get authenticated rider
        const riderId = req.user.id;

        // Validate status
        const allowedStatuses = [
            "in_transit",
            "out_for_delivery",
            "delivered",
            "failed"
        ];

        if (!status) {
            return res.status(400).json({
                message: "Status is required"
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid delivery status"
            });
        }

        // Find delivery
        const delivery = await Delivery.findById(deliveryId);

        if (!delivery) {
            return res.status(404).json({
                message: "Delivery not found"
            });
        }

        // Make sure delivery belongs to this rider
        if (!delivery.rider_id) {
            return res.status(400).json({
                message: "This delivery is not assigned to a rider"
            });
        }

        if (delivery.rider_id.toString() !== riderId.toString()) {
            return res.status(403).json({
                message: "This delivery is not assigned to you"
            });
        }

        // Make sure rider has accepted the delivery
        if (
            delivery.status !== "in_transit" &&
            delivery.status !== "out_for_delivery"
        ) {
            return res.status(400).json({
                message: `Delivery cannot be updated from "${delivery.status}"`
            });
        }

        // Update delivery
        delivery.status = status;

        if (location) {
            delivery.location = location.trim();
        }

        await delivery.save();

        // Rider becomes available after delivery is finished
        if (status === "delivered" || status === "failed") {
            await User.findByIdAndUpdate(riderId, {
                status: "available"
            });
        }

        // Populate references
        await delivery.populate([
            {
                path: "retailer_id",
                select: "first_name last_name phone"
            },
            {
                path: "dispatcher_id",
                select: "first_name last_name phone"
            },
            {
                path: "rider_id",
                select: "first_name last_name phone status"
            }
        ]);

        // Notify dispatcher
        notifyDispatcher("delivery_updated", {
            delivery
        });

        // Notify retailer
        notifyRetailer("delivery_updated", {
            delivery
        });

        // Notify rider
        notifyRider("delivery_updated", {
            delivery
        });

        return res.status(200).json({
            message: "Delivery status updated",
            delivery
        });

    } catch (error) {
        console.error("Error updating delivery status:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};