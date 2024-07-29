import React from 'react';

interface LoaderProps {
    loading: boolean;
}

const Loader: React.FC<LoaderProps> = ({ loading }) => {
    if (!loading) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#822826',
            zIndex: 9999
        }}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 150"
                preserveAspectRatio="xMidYMid meet"
                style={{ width: '100%', height: '100%', maxWidth: '100vh', maxHeight: '100vw' }}
            >
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="frostedGlass">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="frosted" />
                        <feComposite in="frosted" in2="SourceGraphic" operator="atop" />
                    </filter>
                    <filter id="thinOutline">
                        <feMorphology in="SourceAlpha" result="expanded" operator="dilate" radius="0.2"/>
                        <feFlood floodColor="#f5cd6e"/>
                        <feComposite in2="expanded" operator="in"/>
                        <feComposite in="SourceGraphic"/>
                    </filter>
                    <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f6cc5d" />
                        <stop offset="50%" stopColor="#ffd700" />
                        <stop offset="100%" stopColor="#f6cc5d" />
                        <animate attributeName="x1" from="0%" to="100%" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="x2" from="100%" to="200%" dur="2s" repeatCount="indefinite" />
                    </linearGradient>
                </defs>

                <g fontSize="20">
                    <text x="10%" y="-10" filter="url(#glow)">⭐️<animate attributeName="y" from="-10" to="160" dur="4s" repeatCount="indefinite"/></text>
                    <text x="30%" y="-10" filter="url(#glow)">🎁<animate attributeName="y" from="-10" to="160" dur="3.5s" repeatCount="indefinite"/></text>
                    <text x="50%" y="-10" filter="url(#glow)">🤑<animate attributeName="y" from="-10" to="160" dur="4.5s" repeatCount="indefinite"/></text>
                    <text x="70%" y="-10" filter="url(#glow)">💎<animate attributeName="y" from="-10" to="160" dur="4s" repeatCount="indefinite"/></text>
                    <text x="90%" y="-10" filter="url(#glow)">⭐️<animate attributeName="y" from="-10" to="160" dur="3.8s" repeatCount="indefinite"/></text>
                </g>

                <image href="https://od.lk/s/NTlfOTQyOTA1Mzhf/vnvnc%20logo.svg" x="10" y="30" width="80" height="63.58" preserveAspectRatio="xMidYMid meet">
                    <animateTransform attributeName="transform" attributeType="XML" type="translate"
                                      values="0,0; 0,-2; 0,0" dur="2s" repeatCount="indefinite" additive="sum"/>
                    <animateTransform attributeName="transform" attributeType="XML" type="rotate"
                                      values="-3 50 61.79; 3 50 61.79; -3 50 61.79" dur="4s" repeatCount="indefinite" additive="sum"/>
                </image>

                <g transform="translate(50, 118)">
                    <rect x="-25" y="-7" width="50" height="14" rx="3" fill="rgba(255,255,255,0.2)" filter="url(#frostedGlass)" />
                    <rect x="-25" y="-7" width="50" height="14" rx="3" fill="none" stroke="#f6cc5d" strokeWidth="0.5" />
                    <text x="0" y="0" fontFamily="Arial, sans-serif" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle" dominantBaseline="central" filter="url(#thinOutline)">
                        LOADING
                        <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite"/>
                    </text>
                </g>

                <g transform="translate(0, 5)">
                    <rect x="10%" y="130" width="80%" height="6" rx="3" fill="#611e1c"/>
                    <rect x="10%" y="130" width="0" height="6" rx="3" fill="url(#loadingGradient)">
                        <animate attributeName="width" values="0%;80%;0%" keyTimes="0;0.99;1" dur="3.75s" repeatCount="indefinite" />
                    </rect>
                </g>
            </svg>
        </div>
    );
};

export default Loader;