import { NextRequest, NextResponse } from 'next/server';
import supabase from "@/db/supabase";

export async function POST(req: NextRequest) {
    try {
        const { taskId, userId, name, platform, reward, link } = await req.json();

        if (!taskId || !userId || !name || !platform || !reward || !link) {
            return NextResponse.json({ error: "Missing task details" }, { status: 400 });
        }

        const currentTime = new Date();
        const checkTime = new Date(currentTime.getTime() + 15 * 60000); // +15 минут

        // Check if task exists
        const { data: existingTask, error: fetchError } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', taskId)
            .eq('user_id', userId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // If error is not "No rows found"
            console.error("Failed to fetch task:", fetchError);
            return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
        }

        if (!existingTask) {
            // Insert new task
            const { error: insertError } = await supabase
                .from('tasks')
                .insert([
                    {
                        id: taskId,
                        user_id: userId,
                        name,
                        platform,
                        reward,
                        link,
                        status: 'checking',
                        task_check_time: checkTime,
                        created_at: currentTime,
                        updated_at: currentTime
                    }
                ]);

            if (insertError) {
                console.error("Failed to create task:", insertError);
                return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
            }
        } else {
            // Update existing task
            const { error: updateError } = await supabase
                .from('tasks')
                .update({ status: 'checking', task_check_time: checkTime, updated_at: currentTime })
                .eq('id', taskId)
                .eq('user_id', userId);

            if (updateError) {
                console.error("Failed to update task:", updateError);
                return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
            }
        }

        return NextResponse.json({ message: "Task check time updated or created", checkTime }, { status: 200 });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const taskId = searchParams.get('taskId');
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        if (taskId) {
            const { data: task, error } = await supabase
                .from('tasks')
                .select('status, task_check_time')
                .eq('id', taskId)
                .eq('user_id', userId)
                .single();

            if (error) {
                console.error("Failed to fetch task:", error);
                return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
            }

            const currentTime = new Date();
            const taskCheckTime = new Date(task.task_check_time);
            const isCheckTimePassed = currentTime >= taskCheckTime;

            if (isCheckTimePassed && task.status === 'checking') {
                await supabase
                    .from('tasks')
                    .update({ status: 'completed', updated_at: currentTime })
                    .eq('id', taskId)
                    .eq('user_id', userId);
            }

            return NextResponse.json({ status: task.status, isCheckTimePassed }, { status: 200 });
        } else {
            const { data: tasks, error } = await supabase
                .from('tasks')
                .select('id, status')
                .eq('user_id', userId);

            if (error) {
                console.error("Failed to fetch tasks:", error);
                return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
            }

            return NextResponse.json({ tasks }, { status: 200 });
        }
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
