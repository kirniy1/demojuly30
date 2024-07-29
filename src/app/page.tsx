"use client";

import { useContext, useEffect, useState } from "react";
import MobileDetect from "mobile-detect";
import { webAppContext } from "./context";
import CoinMania from "@/components/screens_new/main/main";
import { Image } from "@nextui-org/image";
import MobileFriendlyIcon from '@mui/icons-material/MobileFriendly';
import Loader from '@/components/loader/loader'

export default function Home() {
    const app = useContext(webAppContext);

    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const md = new MobileDetect(window.navigator.userAgent);
        setIsMobile(!!md.mobile());
        setLoading(false);
    }, []);

    if (loading) {
        return <Loader loading={loading} />;
    }

    // if (!isMobile) {
    //     return (
    //         <div className="h-screen w-full bg-black text-center flex items-center justify-center pt-4">
    //             <div className="flex flex-col items-center justify-center">
    //                 <Image src={'/logo.svg'} alt="Logo" width={250} height={250} />
    //                 <h3 className="font-bold my-10 mx-10 text-2xl text-white">
    //                     Пожалуйста, зайдите в приложение с вашего <strong className={'text-blue-500'}>смартфона!</strong>
    //                 </h3>
    //                 <MobileFriendlyIcon fontSize="large" className={'text-yellow-500 '} />
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <>
            {app.version ? (
                <CoinMania />
            ) : (
                <Loader loading={loading} />
            )}
        </>
    );
}
