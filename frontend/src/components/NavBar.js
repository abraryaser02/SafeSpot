import React from "react";
import "../styles/navbar.css";
import logoImage from "../assets/safespotlogo.png";

export default function NavBar() {
  return (
    <div className="navbar">
      <div className="logo-container">
        <img src={logoImage} alt="SafeSpot Logo" />
      </div>
    </div>
  );
}
