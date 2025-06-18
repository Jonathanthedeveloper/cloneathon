import { createContext, Dispatch, SetStateAction, useEffect, useState } from "react";

type SettingsContextType = { compactMode: boolean; setCompactMode: Dispatch<SetStateAction<boolean>>; }

const SettingsContext = createContext<SettingsContextType | null>(null)


export function SettingsProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const [compactMode, setCompactMode] = useState(true);





    useEffect(() => {
        if (compactMode) {
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