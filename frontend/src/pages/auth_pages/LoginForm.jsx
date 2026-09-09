import React from 'react'
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginForm({ 
  switchToRegister,
  email,
  setEmail,
  password,
  setPassword,
  loading,
  errors,
  setErrors,
  message,
  setMessage,
  messageType,
  onSubmit,}) {

     const [showPass, setShowPass] = useState(false);
     
       useEffect(() => {
         if (message) {
           const timer = setTimeout(() => {
             setMessage("");
           }, 3000);
           return () => clearTimeout(timer);
         }
       }, [message]);
  
     return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
            Reflex Delivery
          </h2>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            Login
          </h3>

            {/* error message here */}
          {message && (
            <p
              className={`mt-4 text-sm ${messageType === "error" ? "text-red-500" : "text-green-500"} text-center`}
            >
              {message}
            </p>
          )}
        </div>

        {/* Form */}
        <form className="space-y-5"
         onSubmit={onSubmit}
          onClick={() => setMessage("")}>         

          {/* Email */}
            <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: "" }));
              }}
            />
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          </div>

          {/* Password */}
          <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1.5">
                       Password
                     </label>
         
                     <div className="relative">
                       <input
                         type={showPass ? "text" : "password"}
                         className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                         placeholder="••••••••"
                         value={password}
                         onChange={(e) => {
                           setPassword(e.target.value);
                           if (errors.password) {
                             setErrors((p) => ({ ...p, password: "" }));
                           }
                         }}
                       />
         
                       <button
                         type="button"
                         className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700"
                         onClick={() => setShowPass(!showPass)}
                       >
                         {showPass ? <FaEyeSlash /> : <FaEye />}
                       </button>
                     </div>
         
                     <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                   </div>

         

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors mt-2"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
           <p className="mt-4 text-sm text-slate-500 text-center">
              Don't have an account? 
              <button 
                type="button" 
                className="text-indigo-600 hover:text-indigo-500 font-medium"
                onClick={switchToRegister}
              >
                Register
              </button>
            </p>
          
        </form>
      </div>
    </div>
  )
  
}
