"use client";

import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { webAppContext } from "@/app/context";
import supabase from "@/db/supabase";
import Loader from "@/components/loader/loader";
import { Button, Link } from "@nextui-org/react";
import TapIcon from '@mui/icons-material/TouchApp';
import BonusIcon from '@mui/icons-material/CardGiftcard';
import TasksIcon from '@mui/icons-material/Assignment';
import TopIcon from '@mui/icons-material/EmojiEvents';
import FrensIcon from '@mui/icons-material/People';
import Footer from "@/components/footer/Footer";

interface UserData {
    id: string;
    scores: number | null;
    booster_x2: string | null;
    booster_x3: string | null;
    booster_x5: string | null;
    energy: number | null;
    last_login_time: string;
    maxenergy: number; // Добавляем поле maxenergy
}

type EmojiType = {
    id: number;
    emoji: string;
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    createdAt: number;
    opacity?: number; // Добавляем opacity
};

type ClickType = {
    id: number;
    x: number;
    y: number;
    value: number; // Добавляем значение для отображения
};

const CoinMania: React.FC = () => {
    const app = useContext(webAppContext);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [points, setPoints] = useState(0);
    const [energy, setEnergy] = useState(1000);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isPressed, setIsPressed] = useState(false);
    const [headerEmojis, setHeaderEmojis] = useState<EmojiType[]>([]);
    const [coinEmojis, setCoinEmojis] = useState<EmojiType[]>([]);
    const [clicks, setClicks] = useState<ClickType[]>([]);
    const [lastTapTime, setLastTapTime] = useState(Date.now());
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const headerAnimationSpeedRef = useRef(0.4);
    const lastUpdateTimeRef = useRef(Date.now());
    const coinRef = useRef<HTMLDivElement>(null);
    const consecutiveTapsRef = useRef(0);

    const [coinSize, setCoinSize] = useState(360); // Добавляем состояние для размера монеты

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`/api/user/data?id=${app.initDataUnsafe.user?.id}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log('User data fetched:', data);

                setUserData({ ...data.user });
                setPoints(data.user.scores ?? 0);
                setEnergy(Math.min(data.user.energy ?? 0, data.user.maxenergy)); // Устанавливаем энергию, не превышающую maxenergy
            } catch (error: unknown) {
                if (error instanceof Error) {
                    setError(error.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [app.initDataUnsafe.user?.id]);

    useEffect(() => {
        const saveEnergyAndTime = async () => {
            try {
                const { error } = await supabase
                    .from('users')
                    .update({ energy: energy, last_login_time: new Date().toISOString() })
                    .eq('id', app.initDataUnsafe.user?.id);

                if (error) {
                    throw error;
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    setError(error.message);
                }
            }
        };

        const interval = setInterval(saveEnergyAndTime, 2000);
        return () => clearInterval(interval);
    }, [energy]);

    useEffect(() => {
        const updateCoinSize = () => {
            if (window.innerWidth <= 375) { // Размер для iPhone SE
                setCoinSize(200);
            } else { // Размер для всех других устройств
                setCoinSize(360);
            }
        };

        // Устанавливаем размер монеты при загрузке страницы
        updateCoinSize();

        // Обновляем размер монеты при изменении размера окна
        window.addEventListener('resize', updateCoinSize);
        return () => {
            window.removeEventListener('resize', updateCoinSize);
        };
    }, []);

    const handleButtonClick = async (e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) => {
        if (energy <= 0) return;

        // Проверяем время действия бустера
        const now = new Date();
        let boosterMultiplier = 1;

        if (userData) {
            const boosterTypes = ['booster_x2', 'booster_x3', 'booster_x5'] as const;
            for (const boosterType of boosterTypes) {
                const boosterEndTime = userData[boosterType];
                if (boosterEndTime && new Date(boosterEndTime) > now) {
                    boosterMultiplier = parseInt(boosterType.split('_x')[1]);
                    break;
                }
            }
        }

        const pointsToAdd = 1 * boosterMultiplier; // Значение с учетом бустера

        setPoints(prevPoints => prevPoints + pointsToAdd);
        setEnergy(prevEnergy => Math.min(prevEnergy - 1, userData?.maxenergy ?? 0)); // Уменьшаем энергию, не превышая maxenergy

        const rect = coinRef.current?.getBoundingClientRect();
        if (rect) {
            let clientX, clientY;
            if ('touches' in e) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            addCoinEmojis(x, y);
            setClicks(prev => [...prev, { id: Date.now(), x, y, value: pointsToAdd }]); // Добавляем значение
        }

        try {
            const { error } = await supabase
                .from('users')
                .update({ scores: points + pointsToAdd, energy: energy - 1 })
                .eq('id', app.initDataUnsafe.user?.id);

            if (error) {
                throw error;
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message);
            }
        }
    };

    const handleAnimationEnd = (id: number) => {
        setClicks(prevClicks => prevClicks.filter(click => click.id !== id));
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        setIsPressed(true);
        handleTilt(e);
    };

    const handleMouseUp = () => {
        setIsPressed(false);
        setTilt({ x: 0, y: 0 });
    };

    const handleTilt = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (coinRef.current) {
            const rect = coinRef.current.getBoundingClientRect();
            let clientX, clientY;
            if ('touches' in e) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            const x = clientX - rect.left - rect.width / 2;
            const y = clientY - rect.top - rect.height / 2;
            const tiltX = -(y / rect.height) * 40;
            const tiltY = (x / rect.width) * 40;
            setTilt({ x: tiltX, y: tiltY });
        }
    };

    const getRandomEmoji = () => {
        const emojis = ['🎉', '⭐', '💥', '🚀', '🎤', '🔥'];
        return emojis[Math.floor(Math.random() * emojis.length)];
    };

    const createInitialHeaderEmojis = useCallback((count: number) => {
        return Array(count).fill(null).map(() => ({
            id: Date.now() + Math.random(),
            emoji: getRandomEmoji(),
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 24 + 16,
            speedX: (Math.random() - 0.5) * 0.1,
            speedY: (Math.random() - 0.5) * 0.1,
            createdAt: Date.now()
        }));
    }, []);

    useEffect(() => {
        setHeaderEmojis(createInitialHeaderEmojis(20));
    }, [createInitialHeaderEmojis]);

    const addCoinEmojis = useCallback((x: number, y: number) => {
        const currentTime = Date.now();
        if (currentTime - lastTapTime > 1000) {
            consecutiveTapsRef.current = 0;
        }
        consecutiveTapsRef.current++;

        if (consecutiveTapsRef.current >= 8 && consecutiveTapsRef.current % 8 === 0) {
            const newEmojis = Array(12).fill(null).map(() => ({
                id: Date.now() + Math.random(),
                emoji: getRandomEmoji(),
                x: x + (Math.random() - 0.5) * 60,
                y: y + (Math.random() - 0.5) * 60,
                size: Math.random() * 24 + 14,
                speedX: (Math.random() - 0.5) * 100,
                speedY: -(Math.random() * 200 + 100),
                createdAt: currentTime // Обновляем createdAt
            }));
            setCoinEmojis(prev => [...prev, ...newEmojis]);
        }
        setLastTapTime(currentTime);
    }, [lastTapTime]);

    useEffect(() => {
        const animationFrame = requestAnimationFrame(function animate() {
            const currentTime = Date.now();
            const deltaTime = (currentTime - lastUpdateTimeRef.current) / 1000; // time in seconds
            lastUpdateTimeRef.current = currentTime;

            const timeSinceLastTap = currentTime - lastTapTime;
            headerAnimationSpeedRef.current = timeSinceLastTap > 2000 ? 0.2 : 1;

            setHeaderEmojis(prevEmojis =>
                prevEmojis.map(emoji => ({
                    ...emoji,
                    x: (emoji.x + emoji.speedX * headerAnimationSpeedRef.current + 100) % 100,
                    y: (emoji.y + emoji.speedY * headerAnimationSpeedRef.current + 100) % 100,
                }))
            );

            setCoinEmojis(prevEmojis =>
                prevEmojis
                    .map(emoji => ({
                        ...emoji,
                        x: emoji.x + emoji.speedX * deltaTime,
                        y: emoji.y + emoji.speedY * deltaTime + (0.5 * 500 * deltaTime * deltaTime),
                        speedY: emoji.speedY + 500 * deltaTime,
                        opacity: 1 - (currentTime - emoji.createdAt) / 2000 // Добавляем свойство opacity
                    }))
                    .filter(emoji => (currentTime - emoji.createdAt) < 2000 && emoji.y < window.innerHeight && emoji.y > -50) // Удаляем устаревшие эмодзи
            );

            requestAnimationFrame(animate);
        });

        return () => cancelAnimationFrame(animationFrame);
    }, [lastTapTime]);

    useEffect(() => {
        const preventDefault = (e: Event) => e.preventDefault();
        document.body.style.overflow = 'hidden';
        document.addEventListener('touchmove', preventDefault, { passive: false });
        return () => {
            document.body.style.overflow = 'auto';
            document.removeEventListener('touchmove', preventDefault);
        };
    }, []);

    const id = app.initDataUnsafe.user?.id

    const resetEnergy = async () => {
        try {
            const response = await fetch(`/api/util/reset_energy?userid=${id}`);
            const data = await response.json();
            if (data.success) {
                alert(`Энергия сброшена до ${data.energy}`);
                console.log(`Setting energy to ${data.energy}`); // Add logging to confirm value
                setEnergy(data.energy);  // Immediately set the new energy value
            } else {
                alert(data.error || "Не удалось сбросить энергию");
            }
        } catch (error) {
            alert("Произошла ошибка при сбросе энергии");
            console.error("Error resetting energy:", error);
        }
    };

    if (loading) {
        return <Loader loading={loading} />;
    }

    return (
        <div className="bg-gradient-main min-h-screen flex flex-col items-center text-white font-medium"
             style={{ userSelect: 'none' }}>
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-red-950 z-0"
                 style={{ height: '100vh' }}></div>
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <div className="radial-gradient-overlay"></div>
            </div>

            {/* Emoji animation layer */}
            <div className="fixed inset-0 z-10 overflow-hidden pointer-events-none">
                <div className="relative w-full h-full">
                    {headerEmojis.map(emoji => (
                        <div
                            key={emoji.id}
                            className="absolute text-2xl transition-opacity duration-1000"
                            style={{
                                left: `${emoji.x}%`,
                                top: `${emoji.y}%`,
                                fontSize: `${emoji.size}px`,
                                opacity: `${emoji.opacity}`, // Применяем opacity к каждому эмодзи
                            }}
                        >
                            {emoji.emoji}
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full z-30 min-h-screen flex flex-col items-center text-white">
                {/* Header */}
                <div className="fixed bg-gradient-to-b from-zinc-950 to-transparent w-full z-40">
                    <div className="text-center py-8 relative">
                        <img
                            src='/images/coinmania.webp'
                            alt="COINMANIA"
                            className="mx-auto"
                            width={300}
                        />
                    </div>
                </div>

                {/* Score and associated components */}
                <div className="fixed top-24 mx-auto w-full z-100 px-4">
                    <div className="text-center">

                        <div className="flex justify-center items-center">
                            <img src='/images/coin.png' width={30} alt="Coin" className="mr-2" />
                            <span className="text-3xl font-bold">{points.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Main coin */}
                <div className="absolute center inset-0 flex items-center justify-center select-none z-40">
                    <div
                        ref={coinRef}
                        className="relative select-none touch-none"
                        onClick={handleButtonClick}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleMouseDown}
                        onTouchEnd={handleMouseUp}
                        onTouchCancel={handleMouseUp}
                        style={{
                            userSelect: 'none',
                            pointerEvents: 'none',
                        }}
                    >
                        <img
                            src='/images/notcoin.png'
                            alt="notcoin"
                            draggable="false"
                            width={coinSize} // Замените статическое значение на динамическое
                            style={{
                                pointerEvents: 'auto',
                                userSelect: 'none',
                                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isPressed ? 'scale(0.95)' : 'scale(1)'}`,
                                transition: 'transform 0.1s',
                            }}
                            className='select-none'
                        />

                        {coinEmojis.map(emoji => (
                            <div
                                key={emoji.id}
                                className="absolute text-2xl pointer-events-none transition-opacity duration-1000"
                                style={{
                                    left: `${emoji.x}px`,
                                    top: `${emoji.y}px`,
                                    fontSize: `${emoji.size}px`,
                                    opacity: emoji.opacity ?? 1, // Применяем opacity к каждому эмодзи
                                }}
                            >
                                {emoji.emoji}
                            </div>
                        ))}
                        {clicks.map((click) => (
                            <div
                                key={click.id}
                                className="absolute text-2xl font-bold float-animation"
                                style={{
                                    top: `${click.y - 42}px`,
                                    left: `${click.x - 28}px`,
                                    pointerEvents: 'none'
                                }}
                                onAnimationEnd={() => handleAnimationEnd(click.id)}
                            >
                                +{click.value}⭐️
                            </div>
                        ))}

                    </div>
                </div>

                {/* Блок с энергией */}
                <div className="fixed bottom-36 w-full z-50 ">

                    <div className="justify-between flex mt-4 mx-2">
                        <span className="text-center text-white text-xl font-bold">
                            ⚡️{energy} / {userData?.maxenergy ?? 1000}
                        </span>
                        <button onClick={resetEnergy}
                                className="bg-gradient-to-bl z-9999 from-yellow-400 to-yellow-600 text-sm text-white font-black p-1 rounded-md">
                            Сбросить энергию
                        </button>
                    </div>

                    <div className="w-full bg-[#f9c035] rounded-md items-center px-2 my-2">
                        <div
                            className="bg-gradient-to-r from-[#f3c45a] to-[#fffad0] opacity-10 h-2 rounded-md"
                            style={{width: `${(energy / (userData?.maxenergy ?? 1000)) * 100}%`}}
                        >
                        </div>
                    </div>
                </div>

                {/* Нижний блок меню */}
                <div className={'z-50 w-full fixed bottom-0'}>
                    <Footer activeTab={'Home'}/>
                </div>
            </div>
        </div>
    );
};

export default CoinMania;
