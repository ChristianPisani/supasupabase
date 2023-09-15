import {useEffect, useState} from "react";
import {createClient} from "@supabase/supabase-js";

const supabase = createClient("http://localhost:54321", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0");

let canUpdate = true

function App() {
    const [cursors, setCursors] = useState([{x: 0, y: 0}]);

    const signIn = async () => {
        const {data} = await supabase.auth.signInWithPassword({
            email: 'christian.thorvik@adventuretech.no',
            password: '1234',
        })
        const {user} = data

        window.addEventListener("mousemove", async (e) => {
            if (!user.id || !canUpdate) return

            if (canUpdate) {
                canUpdate = false

                await supabase.from("mousecursortest").upsert({"user_id": user.id, x: e.clientX, y: e.clientY})
            }

            window.setTimeout(() => {
                canUpdate = true
            }, 50)
        });
    }

    useEffect(() => {
        signIn()
    }, []);

    supabase
        .channel('schema-db-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
            },
            () => {
                supabase.from("mousecursortest").select("*").then(({data}) => {
                    setCursors(data.map(cursor => {
                        return {x: cursor.x, y: cursor.y}
                    }))
                })
            }
        )
        .subscribe()

    return (
        <>
            {cursors.map((cursor, index) =>
                <di key={index} style={{
                    backgroundColor: "red",
                    transform: `translateX(${cursor.x}px) translateY(${cursor.y}px)`,
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    position: "fixed",
                    top: 0,
                    left: 0
                }}/>
            )}


        </>
    );
}

export default App;