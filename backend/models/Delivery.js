const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
    {
        customer_name: {
            type: String
        },

        customer_phone: {
            type: String
        },

        customer_address: {
            type: String
        },

        item_description: {
            type: String
        },

        status: {
            type: String,
            default: "waiting"
        },

        location: {
            type: String,
            default: "waiting"
        },

        retailer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        dispatcher_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        rider_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Delivery", deliverySchema);