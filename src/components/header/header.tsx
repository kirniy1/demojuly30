import React from 'react';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Header = () => {
    return (
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 w-full h-[80px] flex items-center justify-between px-4">
            <Link href="/">
                <ArrowBackIcon className="text-white hover:text-zinc-50"/>
            </Link>
            <div className="flex-grow text-center">
                <img src="/images/logo.svg" alt="Logo" className="h-14 mx-auto" />
            </div>
            <div className="w-10"></div> {/* Placeholder to balance the space */}
        </div>
    );
};

export default Header;
