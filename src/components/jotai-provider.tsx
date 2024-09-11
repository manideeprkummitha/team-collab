'use client';

import { Provider } from "jotai";

interface JotaiProviderProps{
    children: React.ReactNode;
}

export const JotaiProvider = (props: JotaiProviderProps) => {
    return (
        <Provider>
            {props.children}
        </Provider>
    )
}