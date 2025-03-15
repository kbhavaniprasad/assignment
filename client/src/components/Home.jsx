import React from "react";
import { useNavigate } from "react-router-dom";
import "./style.css"; // Import the CSS file

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-title">Home Page</h1>
      <button className="home-button" onClick={() => navigate("/Front")}>
        Add Coupon
      </button>
    </div>
  );
};

export default Home;
