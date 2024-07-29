import React from 'react';
import { Link } from '@nextui-org/react';

const Footer = ({ activeTab }) => {
    const tabs = [
        { name: 'Home', icon: '🏠', color: '#f8cc46', path: '/' },
        { name: 'Game', icon: '🎮', color: '#5c35c5', path: '/game' },
        { name: 'Bonus', icon: '🎁', color: '#842221', path: '/bonus' },
        { name: 'Frens', icon: '👥', color: '#2596be', path: '/frens' },
    ];

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Arial, sans-serif',
        }}>
            {/* Navigation Bar */}
            <div style={{
                height: '100px',
                position: 'relative',
                overflow: 'hidden',
                padding: '10px 20px',
                margin: '0 15px 15px',
            }}>
                {/* Frosted Glass Effect */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '25px',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                }} />

                <nav style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                }}>
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.path}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '22%',
                                height: '100px',
                                borderRadius: '20px',
                                background: activeTab === tab.name
                                    ? `linear-gradient(145deg, ${tab.color}, ${tab.color}aa)`
                                    : 'rgba(255, 255, 255, 0.05)',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                transform: activeTab === tab.name ? 'translateY(-5px)' : 'translateY(0)',
                                boxShadow: activeTab === tab.name
                                    ? `0 10px 20px rgba(0,0,0,0.2), 0 0 0 3px ${tab.color}55`
                                    : '0 4px 6px rgba(0,0,0,0.1)',
                                textDecoration: 'none',
                            }}
                        >
                            <div style={{
                                fontSize: '36px',
                                marginBottom: '10px',
                                filter: activeTab === tab.name ? 'none' : 'grayscale(100%)',
                                transition: 'all 0.3s ease',
                            }}>
                                {tab.icon}
                            </div>
                            <span style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: activeTab === tab.name ? 'white' : 'rgba(255,255,255,0.6)',
                                transition: 'all 0.3s ease',
                            }}>
                                {tab.name}
                            </span>
                            {activeTab === tab.name && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-5px',
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: 'white',
                                    boxShadow: `0 0 10px ${tab.color}, 0 0 20px ${tab.color}`,
                                }} />
                            )}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default Footer;
