import { createContext, useEffect, useState } from "react";

const SettingsContext = createContext(null)


export function SettingsProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const [compactMode, setCompactMode] = useState(true);





    useEffect(()=> {
        if(compactMode){
            document.documentElement.classList.add('compact');
        }
    })



    const values = {
        compactMode,
        setCompactMode,
    }
    return (
        <SettingsContext.Provider value={values}>
            {children}
        </SettingsContext.Provider>
    );
}