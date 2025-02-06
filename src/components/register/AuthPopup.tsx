"use client";
import Cookies from 'js-cookie';
import React, { useState, useEffect } from 'react';
import Popup from "@/app/utils/popup"; // Your Popup component
import Register from "@/components/register/register"; // Your Register component
import SigninSignup from "@/components/register/signin_signup"; // Your SigninSignup component
import { useSearchParams } from 'next/navigation';

interface AuthPopupProps {
    onAuthStatusChange: (isAuthenticated: boolean) => void;
}

const Page = ({ onAuthStatusChange }: AuthPopupProps) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const searchParams = useSearchParams(); // Use searchParams to access query parameters

  const handleClosePopup = () => {
    window.history.back();
    setIsPopupVisible(false);

    // Check if user is authenticated after closing the popup
    const accessToken = Cookies.get('access');
    const refreshToken = Cookies.get('refresh');
    onAuthStatusChange(accessToken && refreshToken ? true : false);
  };

  useEffect(() => {
    const notLoggedInParam = searchParams.get('user_registration');
    const notAuthenticated = searchParams.get('user_authentication');
    if (notLoggedInParam === 'true' || notAuthenticated === 'true') {
      setIsPopupVisible(true);
    } else {
      setIsPopupVisible(false);
    }
  }, [searchParams]); // Rerun effect when the searchParams change

  return (
    <div className='absolute top-0 left-0 '>
      <Popup isVisible={isPopupVisible} onClose={handleClosePopup}>
        <Register>
          <SigninSignup onClose={handleClosePopup} />
        </Register>
      </Popup>
    </div>
  );
};

export default Page;
