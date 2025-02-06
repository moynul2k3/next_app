"use client";
import React, { useState, useEffect, Suspense, ReactNode  } from "react";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import Authpopup from "@/components/register/AuthPopup";
import { useSearchParams, useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next";
import SearchBar from "./searchBar";
// import Categories from "@/app/Categories";

function HeaderContent() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [IsAuthenticated, setIsAuthenticated] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();

    const handleSearch = (query: string) => {
        console.log("Searching for:", query);
    };

    const handleOpenPopup = () => {
        const currentParams = new URLSearchParams(searchParams.toString());
        if (!IsAuthenticated) {
        currentParams.set("user_authentication", "true");
        const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
        router.push(newUrl);
        }
    };

    const handleLogOut = () => {
        deleteCookie("access");
        deleteCookie("refresh");
        setIsAuthenticated(false);

        router.push("/");
    };

    const checkAuthentication = () => {
        const accessToken = Cookies.get("access");
        const refreshToken = Cookies.get("refresh");
        if (accessToken && refreshToken) {
        setIsAuthenticated(true);
        } else {
        setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        checkAuthentication();
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 300);
        };

        // Initial scroll state check
        setIsScrolled(window.scrollY > 300);
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <header
        className={`w-full ${isScrolled ? "h-10 md:h-20": "h-12 md:h-28"} z-40 flex justify-between items-center max-md:px-4 md:px-8 lg:px-20 xl:px-32 fixed top-0 transition-all bg-[#1a1a1a] shadow-md text-white`}
        >
            <div className="flex justify-start items-center w-[10%] gap-4 md:gap-8 lg:gap-10">
                <Image
                src="/main_logo.png"
                alt="Vercel logomark"
                width={100}
                height={100}
                />
            </div>
            <div className="flex justify-center items-center w-[60%] h-full ">
                <div className="h-10 w-[70%] overflow-hidden">
                    <SearchBar onSearch={handleSearch} />
                </div>
            </div>
            <div className="flex justify-end items-end pb-5  w-[20%] h-full gap-5 relative">
                {!IsAuthenticated ? (
                    <button className={` w-full px-2 py-3 flex flex-col justify-center items-center ${isScrolled ? "hover:bg-white/5": "hover:bg-black/5"} rounded-md`} onClick={handleOpenPopup}>
                        SignIn / SignUp
                    </button>
                    ) : (
                    <div className={` w-full px-2 py-1 flex flex-col justify-center items-center relative group hover:bg-white/5 rounded-md`}>
                        <div className="flex justify-start items-center gap-2 cursor-pointer ">
                            <div className="p-1 bg-white/20 rounded-full border-[1px] border-black/40 flex justify-center items-center">
                                <Image
                                    className=""
                                    src="/main_logo.png"
                                    alt="Dot_95"
                                    width={30}
                                    height={40}
                                />
                            </div>
                            <div>
                                <p className="font-thin line-clamp-1 text-md">My account</p>
                            </div>
                        </div>
                        <div className={`absolute hidden group-hover:block h-80 w-72 transition-all ease-in-out duration-100 top-[10px] `}>
                            <div className={`profile h-full mt-[60px] w-full bg-black/90 text-white/70 shadow-[inset_1px_1px_5px_#f006] rounded-md px-5 py-5 flex flex-col gap-6`}>
                                <Link href="" className={`flex justify-start items-center gap-3  group/item`}>
                                    <i className='bx bx-smile text-[25px] font-thin'></i> 
                                    <p className="text-sm group-hover/item:underline group-hover/item:text-[#f008] font-semibold">Manage My Account</p>
                                </Link>
                                <Link href="" className={`flex justify-start items-center gap-3  group/item`}>
                                    <i className='bx bxs-shopping-bag-alt  text-[25px] font-thin' ></i>
                                    <p className="text-sm group-hover/item:underline group-hover/item:text-[#f008] font-semibold">My Orders</p>
                                </Link>
                                <Link href="" className={`flex justify-start items-center gap-3  group/item`}>
                                    <i className='bx bx-heart text-[25px] font-thin'></i>
                                    <p className="text-sm group-hover/item:underline group-hover/item:text-[#f008] font-semibold">My Wishlist & Followed Stores</p>
                                </Link>
                                <Link href="" className={`flex justify-start items-center gap-3  group/item`}>
                                    <i className='bx bx-star text-[25px] font-thin'></i> 
                                    <p className="text-sm group-hover/item:underline group-hover/item:text-[#f008] font-semibold">My Reviews</p>
                                </Link>
                                <Link href="" className={`flex justify-start items-center gap-3  group/item`}>
                                    <i className='bx bx-plus rotate-45 border-[1px] border-black/50 rounded-full text-[20px] font-thin'></i> 
                                    <p className="text-sm group-hover/item:underline group-hover/item:text-[#f008] font-semibold">My Returns & Cancellations</p>
                                </Link>
                                <button className={`flex justify-start items-center gap-3  group/item`} onClick={handleLogOut}>
                                    <i className='bx bx-log-out text-[25px] font-thin'></i> 
                                    <p className="text-sm group-hover/item:underline group-hover/item:text-[#f008] font-semibold">Logout</p>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <Link href="/" className="">
                    <div className={`flex justify-between items-center gap-3 hover:bg-white/5  px-6 py-2 rounded-md`}>
                        <div className="relative ">
                            <i className='bx bx-cart text-2xl'></i>
                            <span className="absolute text-white text-xs -right-3 -top-3 rounded-full h-4 w-4 flex justify-center items-center bg-red-400 ">1</span>
                        </div>
                        <span className="text-md">Cart</span>
                    </div>
                </Link>
                {!isScrolled &&(
                    <div className="absolute top-0 right-0 h-10 w-80 flex justify-end items-center gap-5 text-xs">
                        <div className="flex justify-between items-center divide-x-2">
                            <Link href="" className="px-2 hover:underline ">Track Order</Link>
                            <Link href="" className="px-2 hover:underline ">Complaint</Link>
                        </div>
                        <div className="flex justify-between items-center divide-x-2 ">
                            <Link href="" className="px-2 hover:text-red-500"><i className="fa-brands fa-facebook text-lg"></i></Link>
                            <Link href="" className="px-2 hover:text-red-500"><i className="fa-brands fa-instagram text-lg"></i></Link>
                            <Link href="" className="px-2 hover:text-red-500"><i className="fa-brands fa-whatsapp text-lg"></i></Link>
                        </div>
                    </div>
                )}
            </div>

            <Authpopup onAuthStatusChange={setIsAuthenticated} />
        </header>
    );
}

interface HeaderProps {
    children?: ReactNode;
}
export default function Header({ children }: HeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 300);
        };
        // Initial scroll state check
        setIsScrolled(window.scrollY > 300);
        window.addEventListener("scroll", handleScroll);
        return () => {
        window.removeEventListener("scroll", handleScroll);
        };
    }, []);
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HeaderContent />
            <nav className={`max-md:px-4 md:px-8 lg:px-20 xl:px-32 border-b-2 transition-all ease-in-out duration-100  fixed ${isScrolled? "top-20 border-red-400/60": "top-28"} w-full z-30 bg-background `}>
                    {children}
            </nav>
        </Suspense>
    );
}
