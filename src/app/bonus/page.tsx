"use client";

import {useContext, useEffect, useState} from "react";
import { webAppContext } from "../context";
// import Bonus from "@/components/screens/bonus/bonus";
import Bonus from "@/components/screens_new/bonus/Bonus";
import Loader from "@/components/loader/loader";

export default function Home() {
    const app = useContext(webAppContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (app.version) {
            setLoading(false);
        }
    }, [app.version]);

    if (loading) {
        return <Loader loading={loading} />;
    }

    return (
        <>
            {app.version ? (
                <Bonus />
            ) : (
                <Loader loading={loading} />
            )}
        </>
    );
}
