import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/db/supabase';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userid = searchParams.get('userid');

        if (!userid) {
            return NextResponse.json({ error: 'Отсутствует ID пользователя' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('users')
            .select('energy, maxenergy, energyresettime')
            .eq('id', userid)
            .single();

        if (error || !data) {
            throw new Error(error ? error.message : 'Пользователь не найден');
        }

        const currentTime = new Date();
        const lastResetTime = new Date(data.energyresettime);
        const hoursSinceLastReset = (currentTime.getTime() - lastResetTime.getTime()) / 1000 / 3600;

        if (hoursSinceLastReset < 24) {
            return NextResponse.json({ error: 'Энергия может быть сброшена только один раз каждые 24 часа' }, { status: 400 });
        }

        const { error: updateError } = await supabase
            .from('users')
            .update({
                energy: data.maxenergy,
                energyresettime: currentTime.toISOString()
            })
            .eq('id', userid);

        if (updateError) {
            throw new Error(updateError.message);
        }

        return NextResponse.json({ success: true, energy: data.maxenergy });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
