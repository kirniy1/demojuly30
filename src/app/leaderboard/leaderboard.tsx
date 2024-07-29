import React, { useContext, useEffect, useState } from 'react';
import Header from "@/components/header/header";
import { webAppContext } from "@/app/context";
import Loader from "@/components/loader/loader";

interface User {
    first_name: string;
    scores: number;
}

const Leaderboard = () => {
    const app = useContext(webAppContext);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            // Добавим тестовых пользователей
            const testUsers: User[] = [
                { first_name: "TestUser1", scores: 250 },
                { first_name: "TestUser2", scores: 200 },
                { first_name: "TestUser3", scores: 150 },
                { first_name: "TestUser4", scores: 100 },
                { first_name: "TestUser5", scores: 50 },
            ];

            try {
                const response = await fetch('/api/users');
                const data = await response.json();

                if (data.users) {
                    const sortedUsers = [...data.users, ...testUsers].sort((a: User, b: User) => b.scores - a.scores);
                    setUsers(sortedUsers);
                } else {
                    setUsers(testUsers);
                }
            } catch (error) {
                setUsers(testUsers);
                console.error("Failed to fetch users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return <Loader loading={loading} />;
    }

    return (
        <div className="bg-black flex min-h-svh flex-col items-center justify-center text-white p-4">
            <div className="w-full max-w-md flex-col flex gap-4 mx-auto bg-gradient-to-r from-black to-zinc-950 rounded-xl shadow-md overflow-hidden md:max-w-2xl">
                <Header />

                <div className="p-4 text-center">
                    <h1 className="text-2xl font-bold text-white">🏆 ТОП ИГРОКОВ</h1>
                </div>
                <div className="h-96 overflow-y-scroll">
                    {users.map((user, index) => (
                        <div
                            key={index}
                            className={`p-4 flex justify-between items-center ${
                                index === 0 ? 'bg-gradient-to-r from-yellow-500 to-gray-900' :
                                    index === 1 ? 'bg-gradient-to-r from-red-700 to-gray-900' :
                                        'bg-gradient-to-r from-blue-700 to-gray-900'
                            } ${index < 3 ? '' : 'bg-gradient-to-r from-blue-900 to-gray-900'} text-white m-2 rounded-lg`}
                        >
                            <div className="flex items-center">
                                <div className="ml-4">
                                    <p className="font-bold">{index + 1}. {user.first_name}</p>
                                </div>
                            </div>
                            <div>
                                <p>{user.scores}</p>
                                <span className="text-yellow-300">⭐</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-2">
                    <button className="bg-gradient-to-r from-yellow-400 to-yellow-800 text-white py-2 rounded-lg w-full">Мой рейтинг</button>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
