import React, { useState } from 'react';
import './styel.css';

function Front() {
    const [coupon, setCoupon] = useState("");

    const addCoupon = async (couponCode) => {
        try {
            const response = await fetch("http://localhost:5000/api/coupons/add-coupon", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ code: couponCode }) // Send clicked coupon
            });
    
            const data = await response.json();
            if (response.ok) {
                alert(`Coupon Assigned: ${data.coupon.code} for User ID: ${data.coupon.userId}`);
            } else {
                alert(`Error: ${data.message}`); // Show wait time if required
            }
        } catch (error) {
            console.error("Error adding coupon:", error);
            alert("Something went wrong while adding the coupon.");
        }
    };

    return (
        <div>
            <div className="container">
                <div className="box">
                    <h1>COUPONS LIST</h1>
                    <div className="coupons">
                        {["Coupon1", "Coupon2", "Coupon3", "Coupon4", "Coupon5", "Coupon6"].map((couponName, index) => (
                            <div className="coup" key={index}>
                                <h1 className="coupon">#{couponName}</h1>
                                <button className='claim-btn' type="button" onClick={()=>addCoupon(couponName)}>
                                    Claim #{couponName}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Front;
