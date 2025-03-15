import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Home Page</h1>
      <button type="button" onClick={() => navigate("/Front")}>Add Coupon</button>
    </div>
  );
};

export default Home;
