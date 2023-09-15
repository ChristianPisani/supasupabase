import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("http://localhost:54321", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0");

function App() {
    const [countries, setCountries] = useState([]);
    
    const [channelUpdate, setChannelUpdate] = useState(false);

    useEffect(() => {
        getCountries();
    }, []);
    
    useEffect(() => {
        console.log("channelUpdate", channelUpdate)
        getCountries()
    }, [channelUpdate])

    async function getCountries() {
        const { data } = await supabase.from("countries").select();
        setCountries(data);
    }

    const channel = supabase
        .channel('schema-db-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
            },
            (payload) => {
                setChannelUpdate(!channelUpdate)
            }
        )
        .subscribe()

    return (
        <ul>
            {countries.map((country) => (
                <li key={country.name}>{country.name}</li>
            ))}
        </ul>
    );
}

export default App;