"use client";
import React, { useState, useRef, useEffect } from "react";
import {
    checkUserExists,
    loginUser,
    registerUser,
    sendOtp,
    verifyOtp,
    resetPassword,
} from "@/lib/auth/user_auth";


type SigninSignupProps = {
    onClose: () => void;
};



const SigninSignup: React.FC<SigninSignupProps> = ({onClose}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm_password, setConfirmPassword] = useState("");
    const [forgot_password, setForgotPassword] = useState(false);
    const [send_otp, setSendOtp] = useState(false);
    const [verify_otp, setVerifyOtp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isUserExists, setIsUserExists] = useState(null); // null = unknown, true = exists, false = new user
    const [loading, setLoading] = useState(false); // To handle the loading state
    const [errorMessage, setErrorMessage] = useState(""); // For handling errors
    const [successMessage, setSuccessMessage] = useState(""); // For handling errors
    const [otp, setOtp] = useState(new Array(6).fill("")); // Store the OTP
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]); // Ref for input fields
    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
    const [isRunning, setIsRunning] = useState(false); // Timer starts only after success


    function getQueryParam(name:string) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
    function onResponseSuccess() {
        const nextPage = getQueryParam('next');
        if (nextPage) {
            window.location.href = decodeURIComponent(nextPage);
        }
    }


    const handleOtpChange = (value: string, index: number) => {
        if (/^\d$/.test(value) || value === "") {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            if (value && index < inputRefs.current.length - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };


    useEffect(() => {
        if ((timeLeft <= 0 || send_otp === false) && !verify_otp) {
            setSendOtp(false);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isRunning, timeLeft, send_otp, verify_otp]);

    const formatTime = (seconds:number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
    };

    const togglePasswordVisibility = (passwordId:unknown) => {
        if (passwordId === 'password1') {
            setShowPassword(!showPassword);
        } else if (passwordId === 'password2') {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(""); // Reset error message before checking
        setSuccessMessage(""); // Reset error message before checking

        if (isUserExists === null) {
            try {
                setLoading(true);
                const exists = await checkUserExists(email);
                setIsUserExists(exists);
                if (!exists) {
                    setErrorMessage("Your password must contain at least one special character, one capital letter, and be at least 5 characters long.");
                }
            } catch (error) {
                setErrorMessage("An error occurred while checking user existence.");
                console.error("Error during user existence check:", error);
            } finally {
                setLoading(false);
            }
        } else {
            try {
                setLoading(true);
                let response;
                if (isUserExists && forgot_password) {
                    if (!send_otp){
                        response = await sendOtp(email);
                        if (response.status === 'success') {
                            setSendOtp(true);
                            setIsRunning(true);
                            setTimeLeft(60)
                            setSuccessMessage(response.message);
                        }
                    } else {
                        if (!verify_otp) {
                            if (otp.some((digit) => digit === "")) {
                                setErrorMessage("Please complete the OTP");
                                return;
                            }
                            const otpValue = otp.join("");
                            response = await verifyOtp(email, otpValue);
                            if (response.status === 'success') {
                                setVerifyOtp(true);
                                setSuccessMessage(response.message);
                                setTimeout(() => setSuccessMessage(""), 1000);
                                setTimeout(() => setErrorMessage("Your password must contain at least one special character, one capital letter, and be at least 5 characters long."), 1000);
                            } else {
                                setErrorMessage(response.message);
                            }
                        } else {
                            response = await resetPassword(
                                email,
                                password,
                                confirm_password
                            );
                            if (response.status === 'success') {
                                setSuccessMessage(response.message);
                                setTimeout(() => {
                                    onResponseSuccess()
                                    onClose()
                                }, 1000)
                            } else {
                                setErrorMessage(response.message);
                            }
                        }
                    }
                } else if (isUserExists && !forgot_password) {
                    response = await loginUser(
                        email,
                        password
                    );
                    if (response && response.status === 'success') {
                        setSuccessMessage(response.message);
                        setTimeout(() => {
                            onClose()
                            onResponseSuccess()
                            setSuccessMessage("")
                        }, 1000)
                    }
                } else {
                    response = await registerUser(email, password, confirm_password);
                    if (response && response.status === 'success') {
                        setSuccessMessage(response.message);
                        setTimeout(() => {
                            onClose()
                            onResponseSuccess()
                            setSuccessMessage("")
                        }, 1000)
                    }
                }
                if (response && response.status === 'success') {
                    setSuccessMessage(response.message); // Set error message from response
                    if (!forgot_password) {
                        setTimeout(() => setSuccessMessage(""), 1000);
                    }
                }
                if (response && response.status === 'failed') {
                    setErrorMessage(response.message); // Set error message from response
                    if (isUserExists) {
                        if (!send_otp) {
                            setTimeout(() => setErrorMessage(""), 1000);
                        }
                    }
                }
            } catch (error) {
                setErrorMessage("An error occurred during authentication.");
                console.error("Error during authentication:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="p-5 flex-1 bg-red-400/20 relative">
            <form onSubmit={handleSubmit} className="px-5">
                <div className="flex justify-between items-center max-md:mt-[40%] md:mt-10">
                    <div className="text-xl font-semibold">
                        {isUserExists === null ? (
                            "Continue with Email"
                        ) : isUserExists ? (
                            <>
                            {forgot_password ? (
                                <div>
                                    <button 
                                    className="text-sm underline mr-2"
                                        onClick={() => {
                                            setIsUserExists(null);
                                            setForgotPassword(false);
                                            setSendOtp(false);
                                            setVerifyOtp(false);
                                            setOtp(new Array(6).fill(""));
                                            setPassword("");
                                            setConfirmPassword("");
                                        }}
                                    >
                                        <i className="bx bx-arrow-back"></i>
                                    </button>
                                    Forgot Password
                                </div>
                            ): (
                                <div>
                                    <button 
                                    className="text-sm underline mr-2"
                                        onClick={() => {
                                            setIsUserExists(null);
                                            setPassword("");
                                            setConfirmPassword("");
                                        }}
                                    >
                                        <i className="bx bx-arrow-back"></i>
                                    </button>
                                    Sign In
                                </div>
                            )}
                            </>
                        ) : (
                            <>
                                <button 
                                    className="text-sm underline mr-2" 
                                    onClick={() => {
                                        setIsUserExists(null);
                                        setForgotPassword(false);
                                        setPassword("");
                                        setConfirmPassword("");
                                    }}
                                >
                                    <i className="bx bx-arrow-back"></i>
                                </button>
                                Register
                            </>
                        )}
                    </div>
                    <div>
                        {isUserExists === true && !forgot_password && (
                            <>
                                <button
                                    type="button"
                                    className="text-sm underline"
                                    onClick={() => {
                                        setForgotPassword(true);
                                        setPassword("");
                                        setConfirmPassword("");
                                        setIsRunning(false);
                                    }}
                                >
                                    Forgot Password
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <div>
                    {isUserExists === null && (
                        <div className="text-sm mt-2 text-black/40">
                            We`ll check if you have an account, and help create one if you don`t.
                        </div>
                    )}
                </div>

                <div className="relative mt-5">
                    <label htmlFor="email" className="text-[#0009] relative text-sm">
                        Email :
                    </label>
                    <div className="bg-white/80 rounded my-1">
                        <input
                            disabled={isUserExists !== null}
                            type="email"
                            required
                            name="email"
                            id="email"
                            placeholder="Your email"
                            className="px-3 bg-transparent w-full h-10 text-[#000] border-none focus:outline-none rounded peer text-sm"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                        />
                    </div>
                </div>

                {forgot_password && !verify_otp && (
                    <div className={`${send_otp === true ? "" : "pointer-events-none opacity-25"} relative mt-5 `}>
                        <label htmlFor="otp" className="text-[#0009] relative text-sm flex justify-between items-center">
                            <div>Enter OTP:</div>
                            {isRunning && (
                                <div>
                                    {timeLeft > 0 ? (
                                        <div>
                                            Remaining: <span className="text-red-500">{formatTime(timeLeft)}</span>
                                        </div>
                                    ) : (
                                        <div>
                                            <span className="text-red-500">Times up</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </label>
                        <div className="flex justify-center gap-2 mt-2 ">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => {
                                        if (el !== null) {
                                            inputRefs.current[index] = el;
                                        }
                                    }}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(e.target.value, index)}
                                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                    className="w-10 h-10 text-center text-lg border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                />
                            ))}
                        </div>
                    </div> 
                )}

                {(isUserExists !== null) && !((forgot_password || send_otp) && !verify_otp) && (
                    <div className="relative mt-2">
                        <label htmlFor="password" className="text-[#0009] relative text-sm">
                            Password :
                        </label>
                        <div className="bg-white/80 rounded my-1 relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                name="password"
                                id="password"
                                placeholder="Your password"
                                className="px-3 bg-transparent w-full h-10 text-[#000] border-none focus:outline-none rounded peer text-sm"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                }}
                            />
                            <span
                                onClick={() => togglePasswordVisibility('password1')}
                                className="absolute top-0 right-3 cursor-pointer h-full flex items-center"
                            >
                                <i className={`bx ${showPassword ? 'bx-show' : 'bx-hide'} text-[#f006] text-xl z-50`}></i>
                            </span>
                        </div>
                    </div>
                )}
                {(isUserExists === false || verify_otp === true) && (
                    <div className="relative mt-2">
                        <label htmlFor="password" className="text-[#0009] relative text-sm">
                            Confirm Password :
                        </label>
                        <div className="bg-white/80 rounded my-1 relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                name="confirm_password"
                                id="confirm_password"
                                placeholder="Rewrite your password"
                                className="px-3 bg-transparent w-full h-10 text-[#000] border-none focus:outline-none rounded peer text-sm"
                                value={confirm_password}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                }}
                            />
                            <span
                                onClick={() => togglePasswordVisibility('password2')}
                                className="absolute top-0 right-3 cursor-pointer h-full flex items-center"
                            >
                                <i className={`bx ${showConfirmPassword ? 'bx-show' : 'bx-hide'} text-[#f006] text-xl z-50`}></i>
                            </span>
                        </div>
                    </div>
                )}
                <button
                    type="submit"
                    className="mt-5 px-3 bg-[#f004] hover:bg-[#f007] w-full h-10 text-[#000] rounded"
                    disabled={loading}
                >
                    {loading
                    ? "Loading..."
                    : isUserExists === null
                    ? "Continue"
                    : isUserExists
                    ? forgot_password && send_otp && verify_otp
                    ? "Submit"
                    : forgot_password && send_otp
                    ? "Verify"
                    : forgot_password
                    ? "Send OTP"
                    : "Sign In"
                    : "Sign Up"}
                </button>
            </form>
            {isUserExists === null && !forgot_password && (
                <div className="px-5">
                    <div className="flex justify-center items-center gap-2 mt-4">
                        <hr className="h-[2px] bg-black/40 w-full" />
                        or
                        <hr className="h-[2px] bg-black/40 w-full" />
                    </div>
                    <button className="mt-4 px-3 bg-[#fff] hover:bg-[#ffffffb6] w-full h-10 text-[#000] border-none focus:border-none focus:outline-none focus:ring-0 rounded peer text-sm flex justify-center items-center gap-5" >
                        <i className='bx bxl-google text-2xl '></i>
                        Continue with Google
                    </button>
                </div>
            )}
            {successMessage && (
                <div className="text-green-700  absolute bottom-9 left-0 w-full px-5">
                    <p className="text-center text-sm">{successMessage}</p>
                </div>
            )}
            {errorMessage && (
                <div className="text-red-600  absolute bottom-9 left-0 w-full px-5">
                    <p className="text-center text-sm">{errorMessage}</p>
                </div>
            )}
        </div>
    );
};

export default SigninSignup;
