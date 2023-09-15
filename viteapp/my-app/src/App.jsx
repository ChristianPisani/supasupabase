import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("http://localhost:54321", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0");

let canUpdate = true

function App() {
    const [countries, setCountries] = useState([]);
    const [cursors, setCursors] = useState([{ x: 0, y: 0 }]);
    
    const [channelUpdate, setChannelUpdate] = useState(false);
    
    const userId = 4;

    useEffect(() => {
        window.addEventListener("mousemove", async (e) => {
            if(!canUpdate) return
            
            if(canUpdate) {
                canUpdate = false
                
                await supabase.from("mousecursortest").upsert({id: userId, x: e.clientX, y: e.clientY})
            }

            window.setTimeout(() => {
                canUpdate = true
            }, 50)
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
                const cursors = supabase.from("mousecursortest").select("*").then(({data}) => {
                    setCursors(data.map(cursor => {return {x: cursor.x, y: cursor.y}}))
                })
                
                /*if(payload.table === "mousecursortest") {
                    if(payload.new.id === userId) {
                        setCursorPosition({x: payload.new.x, y: payload.new.y})
                    }
                }*/
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
            {cursors.map(cursor => 
                <div style={{
                    backgroundColor: "red",
                    transform: `translateX(${cursor.x}px) translateY(${cursor.y}px)`,
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    position: "fixed",
                    top: 0,
                    left: 0
                }}></div>
            )}

            
        </>
    );
}

export default App;