import { useState } from "react";
import axios from "axios";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/register", { name, email });
      alert(response?.data?.message || "Registration successful");
    } catch (error) {
      console.error("Error response:", error);
      alert("Error: " + (error.response?.data?.error || "Something went wrong"));
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} required />
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
