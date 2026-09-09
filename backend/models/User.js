const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    first_name: { type: String},
    last_name: { type: String},
    email: {type: String, required: true, unique: true},
    phone: {type: String, required: true, unique: true},
    password: {type: String, required: true },
    createdAt: { type: Date, default: Date.now },

    role: { type: String, enum: ["retailer", "dispatcher", "rider"], default : "retailer"},
    status: { type: String, enum: ["available", "unavailable"], default : "available"},

}, { timestamps: true});

module.exports = mongoose.model("User", userSchema)