import React from "react";
import { useState } from "react";
import RegisterForm from "./RegForm";
import API from "../../services/api";

import { useNavigate } from "react-router-dom";

export default function Register({ switchToLogin }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    setErrors({});
    setMessage("");
    setMessageType("");

    const nameRegex = /^[A-Za-z]+$/;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(07|01)\d{8}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    const values = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password: password.trim(),
      confirmPassword: confirmPassword.trim(),
    };

    const allEmpty = Object.values(values).every((v) => !v);

    if (allEmpty) {
      setMessage("All fields are required");
      setMessageType("error");
      return;
    }

    const newErrors = {};

    if (!values.firstName) newErrors.firstName = "First name required";
    if (!values.lastName) newErrors.lastName = "Last name required";
    if (!values.email) newErrors.email = "Email is required";
    if (!values.phone) newErrors.phone = "Phone number is required";
    if (!values.password) newErrors.password = "Password required";
    if (!values.confirmPassword)
      newErrors.confirmPassword = "Password required";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setMessageType("error");
      return;
    }

    if (!nameRegex.test(values.firstName))
      newErrors.firstName = "Only letters allowed";
    if (!nameRegex.test(values.lastName))
      newErrors.lastName = "Only letters allowed";
    if (!emailRegex.test(values.email)) newErrors.email = "Invalid email";

    if (values.phone.startsWith("254")) newErrors.phone = "use 07XXXXXX";
    else if (!phoneRegex.test(values.phone))
      newErrors.phone = "Invalid phone number";

    if (!passwordRegex.test(values.password))
      newErrors.password = "Weak password";
    if (values.password !== values.confirmPassword)
      newErrors.confirmPassword = "Password don'r match";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: `254${values.phone.slice(1)}`,
        password: values.password,
      };
     

      const res = await API.post("/auth/register", payload);

      setMessage(res.data.success || "Signup successfull. Redirecting to login...");
      setMessageType("success");

     setTimeout(() => {
      window.location.href = "/login";
      }, 2000);

    } catch (error) {
      setMessage(error.response?.data?.message || "Signup failed");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <RegisterForm
      switchToLogin={switchToLogin}
      firstName={firstName}
      setFirstName={setFirstName}
      lastName={lastName}
      setLastName={setLastName}
      phone={phone}
      setPhone={setPhone}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      loading={loading}
      setLoading={setLoading}
      errors={errors}
      setErrors={setErrors}
      message={message}
      setMessage={setMessage}
      messageType={messageType}
      setMessageType={setMessageType}
      onSubmit={handleSignUp}
    />
  );
}
