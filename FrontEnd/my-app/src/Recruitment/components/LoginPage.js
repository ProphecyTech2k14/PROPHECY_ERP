// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEye, faEyeSlash, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
// import "../styles/Login.css";
// import prophecyLogo2 from "../Assets/images/prophecy-logo2.png";
// import prophecyLogo from "../Assets/images/prophecy-logo.png";
// import img from "../Assets/images/img.png";
// import BASE_URL from "../../url";

// const LoginPage = () => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const togglePasswordVisibility = () => setShowPassword((prev) => !prev);




//   // In LoginPage.js, modify the handleLogin function:
// const handleLogin = async (e) => {
//   e.preventDefault();
//   setLoading(true);
//   setError(""); // Reset error on new login attempt
//   try {
//     const response = await fetch(`${BASE_URL}/api/auth/login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ username, password }),
//     });
//     const data = await response.json();
//     if (!response.ok) {
//       throw new Error(data.error || "Login failed");
//     }
    
//     // Store token and user data
//     localStorage.setItem("token", data.token);
//     localStorage.setItem("username", data.user.username);
//     localStorage.setItem("role", data.user.role);
//     localStorage.setItem("id", data.user.id);
//     localStorage.setItem("user", JSON.stringify(data.user));
//     localStorage.setItem("firstName", data.user.firstName);

//     console.log("Login successful. Token saved:", data.token);

//     // Redirect based on role
//     if (data.user.role === 'manager') {
//       navigate('/recruitment-dashboard');
//     } else {
//       navigate('/recruiter-view');
//     }
    
//   } catch (error) {
//     console.error("Login Error:", error);
//     setError(error.message);
//   }
//   setLoading(false);
// };
//   return (
//     <div className="login-page-container">
//       <div className="login-container">
//         <div className="logoleft-section">
//           <img src={img} alt="Logo" className="loginside-image" />
//         </div>
//         <div className="logoright-section">
//           <div className="loginlogo-section">
//             <img src={prophecyLogo2} alt="Logo" className="logo" />
//             <img src={prophecyLogo} alt="Prophecy" className="logo1" />
//           </div>
//           <h1>Login</h1>
//           <form onSubmit={handleLogin}>
//             {/* Username Input */}
//             <input
//               type="text"
//               placeholder="Username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//               autoComplete="off"
//             />
//             {/* Password Input */}
//             <div className="loginpassword-container">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 autoComplete="new-password"
//               />
//               <FontAwesomeIcon
//                 icon={showPassword ? faEyeSlash : faEye}
//                 className="eye-icon"
//                 onClick={togglePasswordVisibility}
//               />
//             </div>
//             {/* Show error message with improved styling */}
//             {error && <div className="loginerror-message">{error}</div>}
//             {/* Login Button with improved loading state */}
//             <button 
//               type="submit" 
//               className={`login-button ${loading ? 'loading' : ''}`} 
//               disabled={loading}
//             >
//               {loading ? (
//                 <>
//                   <FontAwesomeIcon 
//                     icon={faCircleNotch} 
//                     spin 
//                     style={{ marginRight: '8px' }} 
//                   />
//                   Logging in...
//                 </>
//               ) : "Login"}
//             </button>
//             {/* Forgot Password */}
//             <p className="loginforgot-password">
//               <a href="/forgot">Forgot Password?</a>
//             </p>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;



import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import "../styles/Login.css";
import prophecyLogo2 from "../Assets/images/prophecy-logo2.png";
import prophecyLogo from "../Assets/images/prophecy-logo.png";
import img from "../Assets/images/img.png";
import BASE_URL from "../../url";

const LoginPage = () => {
  // Login states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Signup states
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");

  const navigate = useNavigate();

  // Toggle functions
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleSignupPasswordVisibility = () => setShowSignupPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    // Reset form states when flipping
    setError("");
    setSignupError("");
    setSignupSuccess("");
    // Reset signup form
    setSignupUsername("");
    setSignupPassword("");
    setConfirmPassword("");
    // Reset login form
    setUsername("");
    setPassword("");
  };

  // Login function
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }
      
      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("id", data.user.id);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("firstName", data.user.firstName);

      console.log("Login successful. Token saved:", data.token);

      // Redirect based on role
      if (data.user.role === 'manager') {
        navigate('/recruitment-dashboard');
      } else {
        navigate('/recruiter-view');
      }
      
    } catch (error) {
      console.error("Login Error:", error);
      setError(error.message);
    }
    
    setLoading(false);
  };

  // Signup function
  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError("");
    setSignupSuccess("");
    
    // Validation
    if (signupPassword !== confirmPassword) {
      setSignupError("Passwords do not match");
      setSignupLoading(false);
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError("Password must be at least 6 characters long");
      setSignupLoading(false);
      return;
    }

    if (!signupUsername.trim()) {
      setSignupError("Username is required");
      setSignupLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: signupUsername.trim(), 
          password: signupPassword
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // FIX: Properly extract error message
        const errorMessage = typeof data.error === 'string' 
          ? data.error 
          : data.message || "Signup failed";
        throw new Error(errorMessage);
      }
      
      setSignupSuccess("Account created successfully! You can now login.");
      
      // Reset form
      setSignupUsername("");
      setSignupPassword("");
      setConfirmPassword("");
      
      // Auto flip back to login after 3 seconds
      setTimeout(() => {
        setIsFlipped(false);
        setSignupSuccess("");
      }, 3000);
      
    } catch (error) {
      console.error("Signup Error:", error);
      // FIX: Ensure error message is always a string
      setSignupError(error.message || "An error occurred during signup");
    }
    
    setSignupLoading(false);
  };

  // Fix: Proper navigation to forgot password
  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate('/forgot-password');
  };

  return (
    <div className="login-page-container">
      <div className="login-container">
        <div className="logoleft-section">
          <img src={img} alt="Logo" className="loginside-image" />
        </div>
        
        {/* Card flip container */}
        <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
          {/* Front side - Login */}
          <div className="flip-card-front">
            <div className="logoright-section">
              <div className="loginlogo-section">
                <img src={prophecyLogo2} alt="Logo" className="logo" />
                <img src={prophecyLogo} alt="Prophecy" className="logo1" />
              </div>
              <h1>Login</h1>
              <form onSubmit={handleLogin}>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="off"
                />
                
                <div className="loginpassword-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="eye-icon"
                    onClick={togglePasswordVisibility}
                  />
                </div>
                
                {error && <div className="loginerror-message">{error}</div>}
                
                <button 
                  type="submit" 
                  className={`login-button ${loading ? 'loading' : ''}`} 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon 
                        icon={faCircleNotch} 
                        spin 
                        style={{ marginRight: '8px' }} 
                      />
                      Logging in...
                    </>
                  ) : "Login"}
                </button>
                
                {/* FIX: Use proper navigation for forgot password */}
                <p className="loginforgot-password">
                  <a href="/forgot-password" onClick={handleForgotPassword}>
                    Forgot Password?
                  </a>
                </p>
                
                <p className="signup-link">
                  Don't have an account? 
                  <a href="#" onClick={(e) => { e.preventDefault(); flipCard(); }}>
                    Sign Up
                  </a>
                </p>
              </form>
            </div>
          </div>

          {/* Back side - Signup */}
          <div className="flip-card-back">
            <div className="logoright-section">
              <div className="loginlogo-section">
                <img src={prophecyLogo2} alt="Logo" className="logo" />
                <img src={prophecyLogo} alt="Prophecy" className="logo1" />
              </div>
              <h1>Sign Up</h1>
              <form onSubmit={handleSignup}>
                <input
                  type="text"
                  placeholder="Username *"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  required
                  autoComplete="off"
                />
                
                <div className="loginpassword-container">
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="Password *"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <FontAwesomeIcon
                    icon={showSignupPassword ? faEyeSlash : faEye}
                    className="eye-icon"
                    onClick={toggleSignupPasswordVisibility}
                  />
                </div>
                
                <div className="loginpassword-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password *"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                    className="eye-icon"
                    onClick={toggleConfirmPasswordVisibility}
                  />
                </div>
                
                {signupError && <div className="loginerror-message">{signupError}</div>}
                {signupSuccess && (
                  <div className="signup-success-message" style={{
                    color: '#28a745',
                    backgroundColor: '#d4edda',
                    border: '1px solid #c3e6cb',
                    padding: '10px',
                    borderRadius: '5px',
                    margin: '10px 0',
                    textAlign: 'center'
                  }}>
                    {signupSuccess}
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className={`login-button ${signupLoading ? 'loading' : ''}`} 
                  disabled={signupLoading}
                >
                  {signupLoading ? (
                    <>
                      <FontAwesomeIcon 
                        icon={faCircleNotch} 
                        spin 
                        style={{ marginRight: '8px' }} 
                      />
                      Creating Account...
                    </>
                  ) : "Create Account"}
                </button>
                
                <p className="signup-link">
                  Already have an account? 
                  <a href="#" onClick={(e) => { e.preventDefault(); flipCard(); }}>
                    Login
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;