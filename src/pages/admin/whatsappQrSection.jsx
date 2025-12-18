// whatsappQrSection.jsx - VERSIÓN FINAL CON REINICIO
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';

const URL_BACKEND = import.meta.env.VITE_API_URL;
const socket = io(URL_BACKEND);

const WhatsappQR = () => {
    const [qrCode, setQrCode] = useState('');
    const [status, setStatus] = useState('loading'); // loading, qr, connected, timeout
    const qrCount = useRef(0);
    const MAX_QR_ATTEMPTS = 2;

    useEffect(() => {
        // Definimos la función de manejo de QR
        const handleQR = (qr) => {
            qrCount.current += 1;
            if (qrCount.current <= MAX_QR_ATTEMPTS) {
                setQrCode(qr);
                setStatus('qr');
            } else {
                setStatus('timeout');
            }
        };

        socket.on('whatsapp-qr', handleQR);

        socket.on('whatsapp-status', (newStatus) => {
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
        });

        return () => {
            socket.off('whatsapp-qr', handleQR);
            socket.off('whatsapp-status');
        };
    }, []);

    const handleRetry = () => {
        console.log("Solicitando reinicio de QR al servidor...");
        qrCount.current = 0; // Reset local
        setStatus('loading');
        setQrCode('');
        
        // Emitir evento al backend para resetear contador y cliente
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
                    <p>⚠️ El tiempo de espera ha expirado.</p>
                    <p>No se generarán más códigos automáticamente.</p>
                    <button 
                        onClick={handleRetry}
                        style={{ padding: '8px 16px', cursor: 'pointer', marginTop: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                        Reintentar conexión ahora
                    </button>
                </div>
            )}
        </div>
    );
};

export default WhatsappQR;