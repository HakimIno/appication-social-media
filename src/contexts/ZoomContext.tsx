// ZoomContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { ZoomOverlay } from 'src/components/ZoomOverlay';

const ZoomContext = createContext(null);

export const ZoomProvider = ({ children }) => {
    const [zoomState, setZoomState] = useState({
        isZoomed: false,
        image: null,
        gestures: null,
        imageStyle: null,
        backgroundStyle: null,
    });

    const showZoom = (config) => {
        setZoomState({ ...config, isZoomed: true });
    };

    const hideZoom = () => {
        setZoomState({ isZoomed: false, image: null, gestures: null, imageStyle: null, backgroundStyle: null });
    };

    return (
        <ZoomContext.Provider value={{ showZoom, hideZoom }}>
            {children}
            <ZoomOverlay
                isVisible={zoomState.isZoomed}
                image={zoomState.image}
                composedGestures={zoomState.gestures}
                imageAnimatedStyle={zoomState.imageStyle}
                backgroundAnimatedStyle={zoomState.backgroundStyle}
            />
        </ZoomContext.Provider>
    );
};

export const useZoom = () => useContext(ZoomContext);