require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Enable CORS
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json()); // Parse JSON requests

// Use MongoDB connection from .env file
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// List of available coupons (Round Robin)
const couponList = ["Coupon1", "Coupon2", "Coupon3", "Coupon4", "Coupon5", "Coupon6"];

const CouponSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }, // Auto-generated user ID
  code: { type: String, required: true },
  lastClaimedAt: { type: Date, default: null } // Track last claim time
});

const Coupon = mongoose.model("Coupon", CouponSchema);

// Define wait time (30 seconds)
const WAIT_TIME = 30 * 1000; // 30 seconds

// API Route to Claim Coupon (Round Robin with Time Restriction)
app.post("/api/coupons/add-coupon", async (req, res) => {
  try {
    // Find the last claimed coupon to determine next coupon
    const lastClaimedCoupon = await Coupon.findOne().sort({ lastClaimedAt: -1 });

    let newUserId = new mongoose.Types.ObjectId(); // Generate unique user ID
    let nextCoupon = couponList[0]; // Default to first coupon

    if (lastClaimedCoupon) {
      const timeSinceLastClaim = new Date() - lastClaimedCoupon.lastClaimedAt;

      if (timeSinceLastClaim < WAIT_TIME) {
        return res.status(403).json({ 
          message: `Please wait ${(WAIT_TIME - timeSinceLastClaim) / 1000} seconds before claiming another coupon.` 
        });
      }

      // Find the next available coupon in the round-robin sequence
      const lastCouponIndex = couponList.indexOf(lastClaimedCoupon.code);
      nextCoupon = couponList[(lastCouponIndex + 1) % couponList.length];
    }

    // Save new coupon assignment
    const newCoupon = new Coupon({ userId: newUserId, code: nextCoupon, lastClaimedAt: new Date() });
    await newCoupon.save();

    res.status(201).json({ 
      message: `Coupon ${nextCoupon} assigned to user ${newUserId}`,
      coupon: { userId: newCoupon.userId, code: newCoupon.code }
    });

  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
