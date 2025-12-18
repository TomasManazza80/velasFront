import React, { useEffect, useState, useRef, useMemo } from 'react';
import io from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';

const URL_BACKEND = import.meta.env.VITE_API_URL;

const WhatsappQR = () => {
    const [qrCode, setQrCode] = useState('');
    const [status, setStatus] = useState('loading'); 
    const qrCount = useRef(0);
    const MAX_QR_ATTEMPTS = 2;

    const socket = useMemo(() => io(URL_BACKEND, {
        transports: ['websocket'], // OBLIGATORIO para evitar el 404 de polling en Render
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
        autoConnect: true,
        forceNew: true // Asegura una conexión limpia
    }), []);

    useEffect(() => {
        // Eventos de conexión del Socket para depuración
        socket.on('connect', () => {
            console.log("✅ Socket conectado al backend");
        });

        socket.on('connect_error', (err) => {
            console.error("❌ Error de conexión:", err.message);
            // Si hay error de conexión prolongado, mostramos el timeout
            if (!socket.connected && status === 'loading') {
                setStatus('timeout');
            }
        });

        const handleQR = (qr) => {
            qrCount.current += 1;
            if (qrCount.current <= MAX_QR_ATTEMPTS) {
                setQrCode(qr);
                setStatus('qr');
            } else {
                setStatus('timeout');
            }
        };

        const handleStatus = (newStatus) => {
            console.log("Estado recibido:", newStatus);
            setStatus(newStatus);
            if (newStatus === 'connected') {
                setQrCode('');
                qrCount.current = 0;
            }
        };

        socket.on('whatsapp-qr', handleQR);
        socket.on('whatsapp-status', handleStatus);

        return () => {
            socket.off('whatsapp-qr');
            socket.off('whatsapp-status');
            socket.off('connect');
            socket.off('connect_error');
        };
    }, [socket, status]);

    const handleRetry = () => {
        console.log("Reintentando...");
        qrCount.current = 0;
        setStatus('loading');
        setQrCode('');
        
        if (!socket.connected) {
            socket.connect();
        }
        
        socket.emit('whatsapp-restart'); 
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '400px', margin: 'auto' }}>
            <h3 style={{ marginBottom: '20px' }}>Conexión WhatsApp</h3>
            
            {status === 'loading' && (
                <div>
                    <p>Estableciendo comunicación...</p>
                    <p style={{fontSize: '10px', color: '#666'}}>Verificando puerto en Render</p>
                </div>
            )}
            
            {status === 'qr' && (
                <div>
                    <p style={{ fontSize: '14px' }}>Escanea para conectar (Intento {qrCount.current} de {MAX_QR_ATTEMPTS})</p>
                    <div style={{ background: 'white', padding: '15px', display: 'inline-block', borderRadius: '10px' }}>
                        <QRCodeSVG value={qrCode} size={200} />
                    </div>
                    <div style={{ marginTop: '15px' }}>
                         <button onClick={handleRetry} style={{ background: '#25D366', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>
                            Generar nuevo QR
                         </button>
                    </div>
                </div>
            )}

            {status === 'connected' && (
                <div style={{ color: '#25D366', fontWeight: 'bold' }}>
                    <p>✅ ¡WhatsApp Vinculado!</p>
                </div>
            )}

            {(status === 'timeout' || status === 'disconnected') && (
                <div style={{ color: '#d32f2f' }}>
                    <p>⚠️ No se pudo conectar</p>
                    <button onClick={handleRetry} style={{ padding: '10px 20px', cursor: 'pointer', marginTop: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
                        Reintentar ahora
                    </button>
                </div>
            )}
        </div>
    );
};

export default WhatsappQR;