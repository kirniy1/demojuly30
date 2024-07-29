import React, { useState, useEffect, useCallback, useContext } from 'react';
import { ArrowLeft } from 'lucide-react';
import Footer from "@/components/footer/Footer";
import { webAppContext } from "@/app/context";
import styles from './Game.module.css';  // Импортируем стили

const SYMBOL_WEIGHTS = { "🪩": 0.0301, "🍹": 0.0708, "🎁": 0.1232, "🎉": 0.2283, "💃": 0.5476 };
const SYMBOLS = Object.entries(SYMBOL_WEIGHTS).flatMap(([s, w]) => Array(Math.round(w * 1000)).fill(s));
const PAYOUTS = { "🪩🪩🪩": 50000, "🍹🍹🍹": 20000, "🎁🎁🎁": 10000, "🎉🎉🎉": 2500, "💃💃💃": 1000, "🪩🪩": 500, "🍹🍹": 400, "🎁🎁": 200, "🎉🎉": 100, "💃💃": 50 };
const REEL_SIZE = 20;
const MAX_SPINS_PER_DAY = 2;

const createReel = () => Array.from({ length: REEL_SIZE }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);

const BonusPage = () => {
    const [reels, setReels] = useState([createReel(), createReel(), createReel()]);
    const [reelPositions, setReelPositions] = useState([0, 0, 0]);
    const [score, setScore] = useState();
    const [spinning, setSpinning] = useState(false);
    const [message, setMessage] = useState("");
    const [showPaytable, setShowPaytable] = useState(false);
    const [backgroundEmojis, setBackgroundEmojis] = useState([]);
    const [winAnimation, setWinAnimation] = useState(null);
    const [winEmojis, setWinEmojis] = useState([]);
    const [spinsLeft, setSpinsLeft] = useState(MAX_SPINS_PER_DAY);
    const app = useContext(webAppContext);
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLargeScreen, setIsLargeScreen] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`/api/user/data?id=${app.initDataUnsafe.user?.id}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setUserData(data.user);
                setScore(data.user.scores || 0); // Set score after fetching user data
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();

        const handleResize = () => {
            setIsLargeScreen(window.innerWidth >= 576);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [app.initDataUnsafe.user?.id]);

    const createBackgroundEmoji = useCallback(() => ({
        id: Math.random(),
        emoji: ['🪩', '🍹', '🎁', '🎉', '💃', '⭐', '💥', '🚀', '🎤', '🔥'][Math.floor(Math.random() * 10)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 24 + 16,
        speed: Math.random() * 0.2 + 0.05,
        angle: Math.random() * 360,
    }), []);

    useEffect(() => {
        setBackgroundEmojis(Array(20).fill().map(createBackgroundEmoji));
        const intervalId = setInterval(() => {
            setBackgroundEmojis(prev => prev.map(emoji => ({
                ...emoji,
                x: (emoji.x + Math.cos(emoji.angle) * emoji.speed) % 100,
                y: (emoji.y + Math.sin(emoji.angle) * emoji.speed) % 100,
                angle: emoji.angle + 0.02,
            })));
        }, 50);
        return () => clearInterval(intervalId);
    }, [createBackgroundEmoji]);

    const calculateWin = (result) => {
        const resultString = result.join("");
        if (PAYOUTS[resultString]) return PAYOUTS[resultString];
        if (result[0] === result[1]) return PAYOUTS[`${result[0]}${result[0]}`] || 0;
        if (result[1] === result[2]) return PAYOUTS[`${result[1]}${result[2]}`] || 0;
        return 0;
    };

    const playWinAnimation = (win, winningSymbols) => {
        if (win >= 50000) setWinAnimation('jackpot');
        else if (win >= 10000) setWinAnimation('major');
        else if (win >= 1000) setWinAnimation('big');
        else setWinAnimation('small');

        const animationDuration = win >= 50000 ? 15000 : win >= 10000 ? 10000 : win >= 1000 ? 7000 : 5000;

        const createEmoji = () => ({
            id: Math.random(),
            emoji: winningSymbols[Math.floor(Math.random() * winningSymbols.length)],
            x: Math.random() * 100,
            y: -20 - Math.random() * 20,
            size: Math.random() * 48 + 32,
            speed: Math.random() * 1 + 0.5,
        });

        setWinEmojis(Array(20).fill().map(createEmoji));

        const animateEmojis = () => {
            setWinEmojis(prev => {
                const updatedEmojis = prev.map(emoji => ({
                    ...emoji,
                    y: emoji.y + emoji.speed,
                })).filter(emoji => emoji.y < 120);
                while (updatedEmojis.length < 20) updatedEmojis.push(createEmoji());
                return updatedEmojis;
            });
        };

        const emojiInterval = setInterval(animateEmojis, 50);

        const clearAnimation = () => {
            setWinAnimation(null);
            clearInterval(emojiInterval);
            setWinEmojis([]);
        };

        setTimeout(clearAnimation, animationDuration);
    };

    const spin = useCallback(async () => {
        if (spinning || spinsLeft <= 0) return;

        setSpinning(true);
        setMessage("");

        try {
            // Fetch spin restrictions
            const response = await fetch('/api/slot/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: app.initDataUnsafe.user?.id })
            });

            const data = await response.json();
            console.log("Spin check response:", data);

            if (!data.result) {
                setMessage("Daily spin limit reached");
                setSpinning(false);
                return;
            }

            setSpinsLeft(data.newSpinCount);

            const newReels = [createReel(), createReel(), createReel()];
            const spinDuration = 2000;
            const intervalDuration = 50;
            let elapsed = 0;

            const spinInterval = setInterval(() => {
                elapsed += intervalDuration;
                setReelPositions(prevPositions => prevPositions.map(pos => (pos + 0.5) % REEL_SIZE));
                if (elapsed >= spinDuration) {
                    clearInterval(spinInterval);
                    setReels(newReels);
                    setReelPositions([0, 0, 0]);
                    setSpinning(false);
                    const result = newReels.map(reel => reel[0]);
                    const win = calculateWin(result);
                    if (win > 0) {
                        setScore(prevScore => prevScore + win);
                        setMessage(`You won ${win}⭐️!`);
                        playWinAnimation(win, result);

                        // Send data to API
                        fetch('/api/slot', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ userId: app.initDataUnsafe.user?.id, points: win })
                        }).then(response => response.json())
                            .then(data => {
                                if (!data.result) {
                                    console.error('Failed to update score');
                                }
                            }).catch(error => {
                            console.error('Error:', error);
                        });
                    } else {
                        setMessage("Try again!");
                    }
                }
            }, intervalDuration);
        } catch (error) {
            console.error('Error checking spin restrictions:', error);
            setMessage("Error checking spin restrictions");
            setSpinning(false);
        }
    }, [spinning, spinsLeft, score, app.initDataUnsafe.user?.id]);

    const getVisibleSymbols = (reelIndex) => {
        const position = reelPositions[reelIndex];
        const reel = reels[reelIndex];
        return [
            reel[(Math.floor(position) - 1 + REEL_SIZE) % REEL_SIZE],
            reel[Math.floor(position) % REEL_SIZE],
            reel[(Math.floor(position) + 1) % REEL_SIZE],
        ];
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className="text-center py-2 relative">
                    <img
                        src='/images/partyslots.webp'
                        alt="COINMANIA"
                        className="mx-auto"
                        width={300}
                    />
                </div>

                <div className="text-center my-2">
                    <p className="text-4xl font-bold text-white">⭐️ {score}</p>
                </div>

                <div className="bg-gradient-to-r from-indigo-700 w-full h-2/3 to-purple-700 rounded-lg p-3 relative bg-opacity-70">
                    <div className="flex justify-around mb-3 relative overflow-hidden h-40">
                        {[0, 1, 2].map(reelIndex => (
                            <div key={reelIndex} className="w-1/3 overflow-hidden h-full relative">
                                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none z-10"></div>
                                <div
                                    className="absolute top-0 left-0 w-full transition-transform duration-100 ease-linear"
                                    style={{ transform: `translateY(${-(reelPositions[reelIndex] % 1) * 100}%)` }}>
                                    {getVisibleSymbols(reelIndex).map((symbol, i) => (
                                        <div key={i} className="text-6xl h-[3.33rem] flex items-center justify-center"
                                             style={{ opacity: i === 1 ? 1 : 0.5 }}>
                                            {symbol}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div
                            className="absolute inset-y-0 left-0 right-0 flex items-center justify-center pointer-events-none">
                            <div
                                className="w-full h-[3.33rem] border-t-2 border-b-2 border-yellow-400 bg-yellow-400 bg-opacity-20">
                            </div>
                        </div>
                        {message && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                                <div className="text-4xl font-bold animate-pulse"
                                     style={{
                                         color: message.includes("won") ? '#fbbf24' : '#a78bfa',
                                         textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000'
                                     }}>
                                    {message}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-3 px-4 rounded-lg transform transition duration-200 hover:scale-105 disabled:opacity-50 text-xl"
                        onClick={spin}
                        disabled={spinning || score < 10 || spinsLeft <= 0}
                    >
                        {spinning ? 'Spinning...' : `SPIN 🎰 (${spinsLeft} left)`}
                    </button>
                </div>

                {!isLargeScreen && (
                    <button
                        onClick={() => setShowPaytable(!showPaytable)}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-4 rounded-lg my-2 transform transition duration-200 hover:scale-105"
                    >
                        {showPaytable ? "Hide Paytable" : "Show Paytable"}
                    </button>
                )}

                {showPaytable && !isLargeScreen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden"
                        onClick={() => setShowPaytable(false)}>
                        <div
                            className="bg-gradient-to-r from-purple-800 to-indigo-800 p-6 rounded-xl shadow-lg max-w-md w-full relative"
                            onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <button
                                    className="text-white hover:text-yellow-400 transition-colors duration-200"
                                    onClick={() => setShowPaytable(false)}
                                >
                                    <ArrowLeft size={32} />
                                </button>
                                <h3 className="text-2xl font-bold text-center text-yellow-400">Paytable</h3>
                                <div className="w-8"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(PAYOUTS).map(([combo, payout]) => (
                                    <div key={combo}
                                         className="flex justify-between items-center bg-black bg-opacity-30 p-2 rounded">
                                        <span className="text-2xl">{combo}</span>
                                        <span className="text-xl font-bold text-yellow-400">{payout}⭐️</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {isLargeScreen && (
                    <div className="mt-4 bg-gradient-to-r from-purple-800 to-indigo-800 p-6 rounded-xl shadow-lg w-full relative">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-center text-yellow-400 w-full">Paytable</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(PAYOUTS).map(([combo, payout]) => (
                                <div key={combo}
                                     className="flex justify-between items-center bg-black bg-opacity-30 p-2 rounded">
                                    <span className="text-2xl">{combo}</span>
                                    <span className="text-xl font-bold text-yellow-400">{payout}⭐️</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {winAnimation && (
                <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
                     style={{ zIndex: 1000 }}>
                    <div className={`text-6xl font-bold animate-bounce ${
                        winAnimation === 'jackpot' ? 'text-yellow-400 animate-pulse' :
                            winAnimation === 'major' ? 'text-green-400' :
                                winAnimation === 'big' ? 'text-blue-400' : 'text-purple-400'
                    }`} style={{
                        textShadow: '3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000'
                    }}>
                        {winAnimation === 'jackpot' ? 'JACKPOT!!!' :
                            winAnimation === 'major' ? 'MAJOR WIN!' :
                                winAnimation === 'big' ? 'Big Win!' : 'Nice Win!'}
                    </div>
                </div>
            )}

            {winEmojis.map(emoji => (
                <div key={emoji.id} className="fixed text-2xl pointer-events-none overflow-hidden" style={{
                    left: `${emoji.x}%`, top: `${emoji.y}%`, fontSize: `${emoji.size}px`,
                    transition: 'top 0.5s linear',
                    zIndex: 999,
                }}>{emoji.emoji}</div>
            ))}

            <div className={'z-50 w-full fixed bottom-0'}>
                <Footer activeTab='Game' />
            </div>
        </div>
    );
};

export default BonusPage;
