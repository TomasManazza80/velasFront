// whatsappQrSection.jsx - VERSIÓN FINAL CON LÍMITE DE CONEXIÓN
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';

const URL_BACKEND = import.meta.env.VITE_API_URL;

// CONFIGURACIÓN DEL SOCKET: Limitamos a 3 intentos de reconexión
const socket = io(URL_BACKEND, {
    reconnectionAttempts: 3, // Máximo 3 intentos de conectar si falla
    reconnectionDelay: 5000, // Espera 5 segundos entre intentos
    timeout: 20000,          // Tiempo de espera por intento
});

const WhatsappQR = () => {
    const [qrCode, setQrCode] = useState('');
    const [status, setStatus] = useState('loading'); 
    const qrCount = useRef(0);
    const MAX_QR_ATTEMPTS = 2;

    useEffect(() => {
        // Manejador cuando Socket.io agota los 3 intentos de conexión
        const handleConnectError = () => {
            console.error("❌ Falló la conexión al servidor tras 3 intentos.");
            setStatus('timeout');
        };

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
            if (newStatus === 'connected') {
                setStatus('connected');
                setQrCode('');
                qrCount.current = 0;
            }
            if (newStatus === 'timeout') {
                setStatus('timeout');
            }
            if (newStatus === 'disconnected' && qrCount.current === 0) {
                setStatus('loading');
            }
        };

        // Suscribirse a eventos
        socket.on('connect_error', handleConnectError);
        socket.on('whatsapp-qr', handleQR);
        socket.on('whatsapp-status', handleStatus);

        return () => {
            socket.off('connect_error', handleConnectError);
            socket.off('whatsapp-qr', handleQR);
            socket.off('whatsapp-status', handleStatus);
        };
    }, []);

    const handleRetry = () => {
        console.log("Solicitando reinicio de conexión...");
        
        // Si el socket se rindió tras los 3 intentos, lo reconectamos manualmente
        if (!socket.connected) {
            socket.connect();
        }

        qrCount.current = 0; 
        setStatus('loading');
        setQrCode('');
        
        socket.emit('whatsapp-restart'); 
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>Estado de WhatsApp</h3>
            
            {status === 'loading' && <p>Iniciando sesión...</p>}
            
            {status === 'qr' && (
                <div>
                    <p>Escanea este código con tu celular (Intento {qrCount.current} de {MAX_QR_ATTEMPTS}):</p>
                    <div style={{ background: 'white', padding: '15px', display: 'inline-block' }}>
                        <QRCodeSVG value={qrCode} size={256} />
                    </div>
                    <div style={{ marginTop: '10px' }}>
                         <button onClick={handleRetry} style={{ color: 'white', padding: '5px', background: 'green', border: 'none', fontSize: '12px', cursor: 'pointer' }}>
                            Generar nuevo código
                         </button>
                    </div>
                </div>
            )}

            {status === 'connected' && (
                <div style={{ color: 'green' }}>
                    <p>✅ ¡WhatsApp Conectado con éxito!</p>
                </div>
            )}

            {status === 'timeout' && (
                <div style={{ color: 'red' }}>
                    <p>⚠️ No se pudo establecer conexión.</p>
                    <p>El servidor no responde o el tiempo de espera expiró.</p>
                    <button 
                        onClick={handleRetry}
                        style={{ padding: '8px 16px', cursor: 'pointer', marginTop: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                        Intentar conectar de nuevo
                    </button>
                </div>
            )}
        </div>
    );
};

export default WhatsappQR;