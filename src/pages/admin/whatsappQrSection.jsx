// whatsappQrSection.jsx - VERSIÓN FINAL ESTABLE
import React, { useEffect, useState, useRef, useMemo } from 'react';
import io from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';

const URL_BACKEND = import.meta.env.VITE_API_URL;

const WhatsappQR = () => {
    const [qrCode, setQrCode] = useState('');
    const [status, setStatus] = useState('loading'); 
    const qrCount = useRef(0);
    const MAX_QR_ATTEMPTS = 2;

    // useMemo asegura que la conexión no se reinicie en cada renderizado de React
    const socket = useMemo(() => io(URL_BACKEND, {
        reconnectionAttempts: 3,     // Se detiene tras 3 intentos fallidos
        reconnectionDelay: 5000,     // 5 segundos entre intentos
        transports: ['websocket'],   // <--- EVITA EL ERROR 404 INFINITO
        autoConnect: true
    }), []);

    useEffect(() => {
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
            setStatus(newStatus);
            if (newStatus === 'connected') {
                setQrCode('');
                qrCount.current = 0;
            }
        };

        // Escuchar cuando el socket se rinde tras 3 intentos
        socket.on('reconnect_failed', () => {
            console.error("No se pudo conectar al servidor de sockets.");
            setStatus('timeout');
        });

        socket.on('whatsapp-qr', handleQR);
        socket.on('whatsapp-status', handleStatus);

        return () => {
            socket.off('reconnect_failed');
            socket.off('whatsapp-qr', handleQR);
            socket.off('whatsapp-status', handleStatus);
        };
    }, [socket]);

    const handleRetry = () => {
        qrCount.current = 0;
        setStatus('loading');
        setQrCode('');
        
        // Si el socket estaba desconectado por límite de intentos, lo despertamos
        if (!socket.connected) {
            socket.connect();
        }
        
        socket.emit('whatsapp-restart'); 
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '400px', margin: 'auto' }}>
            <h3 style={{ marginBottom: '20px' }}>Conexión WhatsApp</h3>
            
            {status === 'loading' && <p>Estableciendo comunicación con el servidor...</p>}
            
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

            {status === 'timeout' && (
                <div style={{ color: '#d32f2f' }}>
                    <p>⚠️ El proceso se ha detenido.</p>
                    <p style={{ fontSize: '13px' }}>Excediste los intentos o el servidor no responde.</p>
                    <button 
                        onClick={handleRetry}
                        style={{ padding: '10px 20px', cursor: 'pointer', marginTop: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
                    >
                        Reintentar ahora
                    </button>
                </div>
            )}
        </div>
    );
};

export default WhatsappQR;