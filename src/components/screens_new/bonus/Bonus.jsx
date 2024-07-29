import React, { useState, useEffect, useContext } from 'react';
import { XCircle } from 'lucide-react';
import Footer from "@/components/footer/Footer";
import { webAppContext } from "@/app/context";
import axios from 'axios';
import styles from './CoinManiaBonusPage.module.css';  // Импортируем стили

const CoinManiaBonusPage = () => {
    const [activeTab, setActiveTab] = useState('Bonus');
    const [activeBooster, setActiveBooster] = useState(null);
    const [showTasks, setShowTasks] = useState(false);
    const [taskStatus, setTaskStatus] = useState({});
    const [loadingTasks, setLoadingTasks] = useState({});
    const app = useContext(webAppContext);

    const tabs = [
        { name: 'Home', icon: '🏠', color: '#f8cc46' },
        { name: 'Game', icon: '🎮', color: '#5c35c5' },
        { name: 'Bonus', icon: '🎁', color: '#842221' },
        { name: 'Friends', icon: '👥', color: '#2596be' },
    ];

    const boosters = [
        { multiplier: 2, duration: 30, cost: 1000, color: '#f8cc46' },
        { multiplier: 3, duration: 15, cost: 2500, color: '#ff7f50' },
        { multiplier: 5, duration: 5, cost: 5000, color: '#ff4500' },
    ];

    const tasks = [
        { platform: 'Telegram', channels: ['Маленькая Виновница', 'VNVNC', 'ANGAR'], reward: 5000, duration: 15, color: '#0088cc' },
        { platform: 'Instagram', channels: ['Маленькая Виновница', 'VNVNC', 'ANGAR'], reward: 10000, duration: 240, color: '#c13584' },
    ];

    const activateBooster = async (multiplier) => {
        try {
            const boosterType = `x${multiplier}`;
            const response = await axios.get(`/api/util/buy_booster?userid=${app.initDataUnsafe.user?.id}&boosterType=${boosterType}`);
            const data = response.data;
            if (data.success) {
                alert(`Бустер ${boosterType} приобретен до ${new Date(data.endTime).toLocaleTimeString()}`);
                setActiveBooster({ multiplier, timeLeft: boosters.find(b => b.multiplier === multiplier).duration * 60 });
            } else {
                alert(data.error || "Не удалось приобрести бустер");
            }
        } catch (error) {
            console.error("Failed to buy booster:", error);
        }
    };

    const subscribeToChannel = async (platform, channel) => {
        try {
            setLoadingTasks(prev => ({ ...prev, [`${platform}-${channel}`]: true }));
            await axios.post('/api/tasks/update', {
                taskId: `${platform}-${channel}`,
                userId: app.initDataUnsafe.user?.id,
                name: channel,
                platform,
                reward: tasks.find(t => t.platform === platform).reward,
                link: ''
            });
            setTaskStatus(prev => ({
                ...prev,
                [`${platform}-${channel}`]: { status: 'checking', timeLeft: tasks.find(t => t.platform === platform).duration * 60 }
            }));
        } catch (error) {
            console.error("Failed to update task:", error);
            setLoadingTasks(prev => ({ ...prev, [`${platform}-${channel}`]: false }));
        }
    };

    useEffect(() => {
        const fetchTaskStatuses = async () => {
            try {
                const { data } = await axios.get(`/api/tasks/update?userId=${app.initDataUnsafe.user?.id}`);
                const statuses = data.tasks.reduce((acc, task) => {
                    acc[task.id] = task.status;
                    return acc;
                }, {});
                setTaskStatus(statuses);
            } catch (error) {
                console.error("Failed to fetch task statuses:", error);
            }
        };

        fetchTaskStatuses();
    }, [app.initDataUnsafe.user?.id]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (activeBooster) {
                setActiveBooster(prev => {
                    if (prev.timeLeft > 0) {
                        return { ...prev, timeLeft: prev.timeLeft - 1 };
                    } else {
                        return null;
                    }
                });
            }

            setTaskStatus(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(key => {
                    if (updated[key].status === 'checking') {
                        if (updated[key].timeLeft > 0) updated[key].timeLeft -= 1;
                        else updated[key].status = 'completed';
                    }
                });
                return updated;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [activeBooster]);

    const buttonStyle = {
        transition: 'all 0.3s ease',
        transform: 'scale(1)',
        ':active': {
            transform: 'scale(0.98)',
        }
    };

    const boosterStyle = (booster) => ({
        ...buttonStyle,
        width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '20px',
        fontSize: '1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer',
        background: activeBooster && activeBooster.multiplier === booster.multiplier
            ? `linear-gradient(145deg, ${booster.color}, ${booster.color}aa)`
            : `linear-gradient(145deg, ${booster.color}aa, ${booster.color}55)`,
        color: '#ffffff',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    });

    const taskButtonStyle = (task, status, isMain = false) => ({
        ...buttonStyle,
        width: '100%',
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '15px',
        fontSize: isMain ? '1.1rem' : '1rem',
        fontWeight: 'bold',
        border: 'none',
        cursor: status === 'completed' ? 'default' : 'pointer',
        background:
            status === 'completed' ? '#4a4a4a' :
                status === 'checking' ? `linear-gradient(145deg, ${task.color}dd, ${task.color})` :
                    `linear-gradient(145deg, ${task.color}, ${task.color}dd)`,
        color: '#f0f0f0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        gridColumn: isMain ? 'span 2' : 'span 1',
    });

    const infoBoxStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderLeft: '4px solid #f8cc46',
        padding: '15px',
        marginBottom: '25px',
        borderRadius: '0 10px 10px 0',
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.bonusSection}>
                    <h2 className={styles.title}>🎁 Бустеры</h2>
                    {boosters.map((booster) => {
                        const isActive = activeBooster && activeBooster.multiplier === booster.multiplier;
                        const minutes = isActive ? Math.floor(activeBooster.timeLeft / 60) : 0;
                        const seconds = isActive ? activeBooster.timeLeft % 60 : 0;

                        return (
                            <button key={booster.multiplier} onClick={() => activateBooster(booster.multiplier)} style={boosterStyle(booster)}>
                                {isActive
                                    ? `x${booster.multiplier} - ${minutes}:${seconds.toString().padStart(2, '0')}`
                                    : `Купить x${booster.multiplier} на ${booster.duration} минут (${booster.cost}⭐️)`
                                }
                            </button>
                        );
                    })}
                    <div style={infoBoxStyle}>
                        <p style={{fontSize: '0.9rem', color: '#f0f0f0', lineHeight: '1.4'}}>
                            Бустеры временно увеличивают количество монет, получаемых за каждое нажатие в разделе 🏠 Home. x2 удваивает, x3 утраивает, а x5 увеличивает в пять раз ваш доход. Только один бустер может быть активен одновременно.
                        </p>
                    </div>
                </div>

                <button onClick={() => setShowTasks(true)} className={styles.tasksButton}>
                    ✅ Задания
                </button>
            </div>

            {/* Navigation Bar */}
            <div className={'z-50 w-full fixed bottom-0'}>
                <Footer activeTab='Bonus'/>
            </div>

            {/* Tasks Pop-up */}
            {showTasks && (
                <div className={styles.tasksPopup}>
                    <div className={styles.tasksPopupContent}>
                        <div className={styles.tasksPopupHeader}>
                            <h2 className={styles.tasksPopupTitle}>✅ Задания</h2>
                            <button onClick={() => setShowTasks(false)} className={styles.closeButton}><XCircle size={30} /></button>
                        </div>
                        <div style={infoBoxStyle}>
                            <p style={{fontSize: '0.9rem', lineHeight: '1.4'}}>Для проверки подписки на каждый аккаунт мы проведем проверку. Для Telegram это займет 15 минут. Для Instagram может потребоваться до 24 часов. Вернитесь в этот раздел позже, чтобы проверить прогресс верификации. В случае успеха вы получите награды на баланс Coinmania.</p>
                        </div>
                        {tasks.map((task) => (
                            <div key={task.platform} style={{marginBottom: '25px'}}>
                                <h3 className={styles.tasksPopupPlatform}>{task.platform}</h3>
                                <div className={styles.taskButtonGrid}>
                                    {task.channels.map((channel, index) => {
                                        const status = taskStatus[`${task.platform}-${channel}`]?.status || 'pending';
                                        const timeLeft = taskStatus[`${task.platform}-${channel}`]?.timeLeft || 0;
                                        const minutes = Math.floor(timeLeft / 60);
                                        const seconds = timeLeft % 60;
                                        const isMain = index === 0;
                                        return (
                                            <button key={channel} onClick={() => subscribeToChannel(task.platform, channel)} style={taskButtonStyle(task, status, isMain)} disabled={status === 'completed' || status === 'checking'}>
                                                {status === 'completed' ? `✅ ${task.reward / 1000}K⭐️` : status === 'checking' ? `${minutes}:${seconds.toString().padStart(2, '0')}` : (
                                                    <>
                                                        {channel}
                                                        <br />
                                                        <span style={{fontSize: '0.8em'}}>{task.reward / 1000}K⭐️</span>
                                                    </>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoinManiaBonusPage;
