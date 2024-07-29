import supabase from "@/db/supabase";

export default async function increase_max_energy(user: any, increment: number) {
    try {
        // Логирование user для отладки
        console.log("User ID:", user);

        // Получаем текущую максимальную энергию пользователя
        const { data, error } = await supabase
            .from("users")
            .select("maxenergy")
            .eq("id", user)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        if (!data) {
            throw new Error("User not found");
        }

        const currentMaxEnergy = data.maxenergy;

        // Рассчитываем новое значение максимальной энергии
        const newMaxEnergy = currentMaxEnergy + increment;

        // Обновляем значение максимальной энергии пользователя
        const { error: updateError } = await supabase
            .from("users")
            .update({ maxenergy: newMaxEnergy })
            .eq("id", user);

        if (updateError) {
            throw new Error(updateError.message);
        }

        console.log("Max energy updated successfully");
    } catch (error) {
        console.error("Error updating max energy:", error);
    }
}
