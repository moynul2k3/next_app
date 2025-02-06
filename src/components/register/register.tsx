import Image from "next/image";
import React from "react";
type RegisterProps = {
    children: React.ReactNode;
};

const Register: React.FC<RegisterProps> = ({children}) => {
    return (
        <div className='h-[480px] w-[1000px] flex justify-between'>
            <div className='p-5 flex-1 flex justify-center items-center '>
                <Image
                    className=""
                    src="/main_logo.png"
                    alt="Dot_95"
                    width={300}
                    height={300}
                />
            </div>
            {children}
        </div>
    )
}

export default Register;