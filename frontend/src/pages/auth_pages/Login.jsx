import React from "react";
import LoginForm from "./LoginForm";
import { useState } from "react";
import API from "../../services/api";

import { getUserRole } from "@/utils/auth";

import { useNavigate } from "react-router-dom";
import WelcomeLoader from "./WelcomeLoader";
export default function Login({ switchToRegister }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [showWelcome, setShowWelcome] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setErrors({});
    setMessage("");
    setMessageType("");

    

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    const values = {
      
      email: email.trim(),
      password: password.trim(),
      
    };

    const allEmpty = Object.values(values).every((v) => !v);

    if (allEmpty) {
      setMessage("All fields are required");
      setMessageType("error");
      return;
    }

    const newErrors = {};

  
    if (!values.email) newErrors.email = "Email is required";
   
    if (!values.password) newErrors.password = "Password required";
  

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setMessageType("error");
      return;
    }

   
    if (!emailRegex.test(values.email)) newErrors.email = "Invalid email";

  

    if (!passwordRegex.test(values.password))
      newErrors.password = "Weak password";
  

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const payload = {
       
        email: values.email,
        
        password: values.password,
      };

      const res = await API.post("/auth/login", payload);
      localStorage.setItem("token", res.data.token);

      setMessage(res.data.success || "Login successful. Redirecting...");
      setMessageType("success");

      setShowWelcome(true);

      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

 
  
const role = getUserRole()

let greeting;

switch (role) {
  case "retailer":
    greeting = "Welcome to Retailer Dashboard";    
    break;
  case "dispatcher":
    greeting = "Welcome to Dispatcher Dashboard"
    break;
  case "rider":
    greeting = "Welcome to Rider Dashboard"
  default:
    break;
}




if (showWelcome) {
  return <WelcomeLoader message={greeting}/>;
}

  return (
    <div>


      <LoginForm
       switchToRegister={switchToRegister}
       loading={loading}
       email={email}
       setEmail={setEmail}
       onSubmit={handleLogin}
       password={password}
       setPassword={setPassword}
       message={message}
       setMessage={setMessage}
       messageType={messageType}
       errors={errors}
       setErrors={setErrors}      
      />
    </div>
  );
}
