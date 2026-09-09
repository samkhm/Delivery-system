const mongoose = require("mongoose");

const assignedDeliverySchema = new mongoose.Schema(
    {
        delivery_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Delivery",
            required: true
        },

        dispatcher_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        rider_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "AssignedDelivery",
    assignedDeliverySchema
);