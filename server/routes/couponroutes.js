const express = require("express");
const Coupon = require("../models/Coupon");

const router = express.Router();

// API to Add a Coupon from Frontend
router.post("/add-coupon", async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "Coupon code is required!" });

    try {
        const newCoupon = new Coupon({ code });
        await newCoupon.save();
        res.status(201).json({ message: "Coupon added successfully!", coupon: newCoupon });
    } catch (err) {
        res.status(500).json({ message: "Error adding coupon", error: err.message });
    }
});

module.exports = router;
