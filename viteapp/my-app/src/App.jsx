import {useEffect, useState} from "react";
import {createClient} from "@supabase/supabase-js";

const supabase = createClient("http://localhost:54321", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0");

let canUpdate = true
let cursorDown = false
let userId = "";
let noteText = "";
let cursorX = 0
let cursorY = 0

function App() {
    const [notes, setNotes] = useState([]);

    addEventListener("mousedown", () => {
        cursorDown = true
    })
    addEventListener("mouseup", () => {
        cursorDown = false
    })

    const updateNote = async () => {
        await supabase.from("note").upsert({
            "user_id": userId,
            x: cursorX,
            y: cursorY,
            text: noteText,
            "category_id": 0,
            "board_id": 0
        })
    }
    const signIn = async () => {
        const {data} = await supabase.auth.signInWithPassword({
            email: 'christian.thorvik@adventuretech.no',
            password: '1234',
        })
        const {user} = data
        userId = user.id

        const note = await supabase.from("note").select().eq("user_id", userId);

        noteText = note.data[0]?.text || ""

        window.addEventListener("mousemove", async (e) => {
            if (!user.id || !canUpdate || !cursorDown || (e.clientX === 0 && e.clientY === 0)) return

            if (canUpdate) {
                canUpdate = false

                cursorX = e.clientX
                cursorY = e.clientY

                await updateNote()
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
                supabase.from("note").select("*").then(({data}) => {
                    setNotes(data)
                    noteText = data.find(note => note["user_id"] === userId)?.text || ""
                })
            }
        )
        .subscribe()

    return (
        <>
            {notes.map((note, index) =>
                <div key={index} style={{
                    backgroundColor: "beige",
                    transform: `translateX(${note.x}px) translateY(${note.y}px)`,
                    width: "150px",
                    height: "80px",
                    position: "fixed",
                    color: "black",
                    top: 0,
                    left: 0,
                    userSelect: "none",
                }}>
                    <input value={note.text} onChange={async (e) => {
                        noteText = e.target.value
                        await updateNote()
                    }}></input>
                </div>
            )}


        </>
    );
}

export default App;