import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("http://localhost:54321", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0");

let canUpdate = true

function App() {
    const [countries, setCountries] = useState([]);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    
    const [channelUpdate, setChannelUpdate] = useState(false);

    useEffect(() => {
        window.addEventListener("mousemove", async (e) => {
            if(!canUpdate) return
            
            if(canUpdate) {
                canUpdate = false

                const {data: existingMousePos} = await supabase.from("mousecursortest").select().eq("id", 1)

                if (!existingMousePos.length > 0) {
                    const {data, error} = await supabase.from("mousecursortest").insert({id: 1, x: 0, y: 0})
                }

                await supabase.from("mousecursortest").update({x: e.clientX, y: e.clientY}).eq("id", 1)
            }

            window.setTimeout(() => {
                canUpdate = true
            }, 100)
        });
    }, []);

    const channel = supabase
        .channel('schema-db-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
            },
            (payload) => {
                if(payload.table === "mousecursortest") {
                    setCursorPosition({x: payload.new.x, y: payload.new.y})
                }
            }
        )
        .subscribe()

    return (
        <>
        <ul>
            {countries.map((country) => (
                <li key={country.name}>{country.name}</li>
            ))}
        </ul>
            <div style={{backgroundColor: "red", transform: `translateX`}}></div>
            
            <p>Cursor position: x: {cursorPosition.x} y: {cursorPosition.y}</p>
        </>
    );
}

export default App;