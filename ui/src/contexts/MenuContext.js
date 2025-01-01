import React, { createContext, useContext } from 'react';

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
    var events = {};

    const subscribeToEvent = (path, callback) => {
        events[path] = callback
    }

    const publishToEvent = (path, isPublished) => {
        events[path](isPublished)
    };

    return (
        <MenuContext.Provider value={{ subscribeToEvent, publishToEvent }}>
            {children}
        </MenuContext.Provider>
    );
};

export const useMenuContext = () => useContext(MenuContext);
