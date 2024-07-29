import React, { createContext, useEffect, useState } from "react";
import type { TelegramWebApps } from 'telegram-webapps-types-new';

interface IProps {
    children: React.ReactNode;
}

export const webAppContext = createContext<TelegramWebApps.WebApp>({} as TelegramWebApps.WebApp);

export const WebAppProvider = ({ children }: IProps) => {
    const [app, setApp] = useState({} as TelegramWebApps.WebApp);

    useEffect(() => {
        setApp(window.Telegram.WebApp);
    }, []);

    useEffect(() => {
        if (!app) return;
        if (app.ready) app.ready();

        const addUserToContext = async () => {
            const userId = app.initDataUnsafe?.user?.id;
            const username = app.initDataUnsafe?.user?.username;
            const firstName = app.initDataUnsafe?.user?.first_name;
            const lastName = app.initDataUnsafe?.user?.last_name;
            const scores = Number('0');
            const referralId = app.initDataUnsafe?.start_param; // Получаем реферальный ID из start_param

            if (!userId || !username || !firstName) {
                console.error("User data is missing");
                return;
            }

            try {
                const response = await fetch('/api/user/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: userId,
                        first_name: firstName,
                        last_name: lastName,
                        username: username,
                        scores: scores,
                        referal_id: referralId
                    }),
                });

                const result = await response.json();
                console.log(result.message);
            } catch (error) {
                console.error("Error adding user to context:", error);
            }
        };

        addUserToContext();
    }, [app]);

    return (
        <webAppContext.Provider value={app}>{children}</webAppContext.Provider>
    );
};
