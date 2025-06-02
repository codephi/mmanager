import React, { useState, useRef, useEffect } from 'react';

interface VolumeControlProps {
    muted: boolean;
    volume: number; // 0 ~ 1
    onMuteToggle: () => void;
    onVolumeChange: (value: number) => void;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({ muted, volume, onMuteToggle, onVolumeChange }) => {
    const [hover, setHover] = useState(false);
    const [dragging, setDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const closeTimeoutRef = useRef<any | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!dragging && containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setHover(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dragging]);

    const delayedClose = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setHover(false);
        }, 300); // delay de 300ms
    };

    const cancelClose = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    };

    return (
        <div
            ref={containerRef}
            onMouseEnter={() => { cancelClose(); setHover(true); }}
            onMouseLeave={() => { if (!dragging) delayedClose(); }}
            style={{ position: 'relative' }}
            className="no-drag"

        >
            <button onClick={onMuteToggle} style={buttonStyle}>
                {muted || volume === 0 ? '🔇' : '🔊'}
            </button>

            {hover && (
                <div style={sliderContainerStyle}>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={muted ? 0 : volume}
                        onMouseDown={() => setDragging(true)}
                        onMouseUp={() => setDragging(false)}
                        onTouchStart={() => setDragging(true)}
                        onTouchEnd={() => setDragging(false)}
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                        style={sliderStyle}
                    />
                </div>
            )}
        </div>
    );
};

const buttonStyle: React.CSSProperties = {
    background: '#444',
    color: '#fff',
    border: 'none',
    borderRadius: 3,
    cursor: 'pointer',
    width: 25,
    height: 25,
    padding: 0,
    fontSize: 16
};

const sliderContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    width: 30,
    height: 100,
    background: '#333',
    borderRadius: 5,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    marginTop: 5,
    zIndex: 9999
};

const sliderStyle: React.CSSProperties = {
    WebkitAppearance: 'slider-vertical',
    height: '100px',
    width: '10px'
};
