// WhatsappQR.jsx
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';

const socket = io('http://localhost:3001'); // URL de tu backend

const WhatsappQR = () => {
    const [qrCode, setQrCode] = useState('');
    const [status, setStatus] = useState('loading'); // loading, qr, connected

    useEffect(() => {
        socket.on('whatsapp-qr', (qr) => {
            setQrCode(qr);
            setStatus('qr');
        });

        socket.on('whatsapp-status', (newStatus) => {
            if (newStatus === 'connected') {
                setStatus('connected');
                setQrCode(''); // Limpiar QR al conectar
            }
        });

        return () => {
            socket.off('whatsapp-qr');
            socket.off('whatsapp-status');
        };
    }, []);

    return (
        <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd' }}>
            <h3>Estado de WhatsApp</h3>
            
            {status === 'loading' && <p>Iniciando sesión...</p>}
            
            {status === 'qr' && (
                <div>
                    <p>Escanea este código con tu celular:</p>
                    <div style={{ background: 'white', padding: '15px', display: 'inline-block' }}>
                        <QRCodeSVG value={qrCode} size={256} />
                    </div>
                </div>
            )}

            {status === 'connected' && (
                <div style={{ color: 'green' }}>
                    <p>✅ ¡WhatsApp Conectado con éxito!</p>
                </div>
            )}
        </div>
    );
};

export default WhatsappQR;