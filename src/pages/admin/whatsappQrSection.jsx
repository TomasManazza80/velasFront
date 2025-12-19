import React, { useEffect, useState, useRef, useMemo } from 'react';
import io from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';

// Si estás en local usa http://localhost:3000
// Si estás en producción, usa tu URL de Render: https://velasback.onrender.com
const URL_BACKEND = "http://localhost:3000"; 

const WhatsappQR = () => {
    const [qrCode, setQrCode] = useState('');
    const [status, setStatus] = useState('loading'); // loading, qr, connected, timeout, disconnected
    const qrCount = useRef(0);
    const MAX_QR_ATTEMPTS = 3; 

    // Inicializamos el socket con useMemo para que la instancia sea persistente
    const socket = useMemo(() => io(URL_BACKEND, {
        transports: ['websocket', 'polling'], // Mantenemos polling como backup para Render
        reconnectionAttempts: 5,
        autoConnect: true,
    }), []);

    useEffect(() => {
        // Escuchar cuando se genera un nuevo QR
        socket.on('whatsapp-qr', (qr) => {
            console.log("📥 Nuevo QR recibido");
            qrCount.current += 1;
            
            if (qrCount.current <= MAX_QR_ATTEMPTS) {
                setQrCode(qr);
                setStatus('qr');
            } else {
                setStatus('timeout');
            }
        });

        // Escuchar cambios de estado globales (conectado, desconectado, etc)
        socket.on('whatsapp-status', (newStatus) => {
            console.log("📡 Estado de WhatsApp:", newStatus);
            setStatus(newStatus);
            
            if (newStatus === 'connected') {
                setQrCode('');
                qrCount.current = 0;
            }
        });

        socket.on('connect', () => {
            console.log("✅ Socket conectado al backend ID:", socket.id);
        });

        socket.on('connect_error', (err) => {
            console.error("❌ Error de conexión:", err.message);
        });

        // Limpieza al desmontar el componente
        return () => {
            socket.off('whatsapp-qr');
            socket.off('whatsapp-status');
            socket.off('connect');
            socket.off('connect_error');
        };
    }, [socket]); // Solo depende del socket persistente

    const handleRetry = () => {
        console.log("🔄 Reiniciando proceso de vinculación...");
        qrCount.current = 0;
        setQrCode('');
        setStatus('loading');
        
        // Emitir evento al backend para que destruya y reinicie Puppeteer
        socket.emit('whatsapp-restart'); 
    };

    return (
        <div style={containerStyle}>
            <h3 style={{ marginBottom: '10px' }}>Conexión WhatsApp</h3>
            
            {/* ESTADO: CARGANDO / CONECTANDO */}
            {status === 'loading' && (
                <div style={statusBoxStyle}>
                    <p>Iniciando navegador interno...</p>
                    <p style={{ fontSize: '11px', color: '#666' }}>Esto puede tardar unos segundos en Render</p>
                    <div className="spinner"></div> 
                </div>
            )}
            
            {/* ESTADO: MOSTRANDO QR */}
            {status === 'qr' && qrCode && (
                <div>
                    <p style={{ fontSize: '14px', marginBottom: '15px' }}>
                        Escanea el código con tu celular <br/>
                        <small>(Intento {qrCount.current} de {MAX_QR_ATTEMPTS})</small>
                    </p>
                    <div style={qrContainerStyle}>
                        <QRCodeSVG value={qrCode} size={220} includeMargin={true} />
                    </div>
                    <div style={{ marginTop: '20px' }}>
                         <button onClick={handleRetry} style={buttonSecondaryStyle}>
                            Generar nuevo QR
                         </button>
                    </div>
                </div>
            )}

            {/* ESTADO: CONECTADO EXITOSAMENTE */}
            {status === 'connected' && (
                <div style={{ ...statusBoxStyle, color: '#25D366' }}>
                    <div style={{ fontSize: '50px' }}>✅</div>
                    <p style={{ fontWeight: 'bold', fontSize: '18px' }}>¡WhatsApp Vinculado!</p>
                    <p style={{ color: '#666', fontSize: '13px' }}>El sistema ya puede enviar notificaciones.</p>
                </div>
            )}

            {/* ESTADOS DE ERROR O DESCONEXIÓN */}
            {(status === 'timeout' || status === 'disconnected' || status === 'auth_failure') && (
                <div style={{ ...statusBoxStyle, color: '#d32f2f' }}>
                    <p>⚠️ La conexión ha fallado o expirado</p>
                    <button onClick={handleRetry} style={buttonPrimaryStyle}>
                        Reintentar ahora
                    </button>
                </div>
            )}
        </div>
    );
};

// --- ESTILOS EN LÍNEA ---
const containerStyle = {
    textAlign: 'center',
    padding: '30px',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    maxWidth: '420px',
    margin: '20px auto',
    backgroundColor: '#fff',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const qrContainerStyle = {
    background: 'white',
    padding: '10px',
    display: 'inline-block',
    borderRadius: '8px',
    border: '1px solid #eee'
};

const statusBoxStyle = {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
};

const buttonPrimaryStyle = {
    padding: '10px 25px',
    cursor: 'pointer',
    marginTop: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold'
};

const buttonSecondaryStyle = {
    background: '#25D366',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
};

export default WhatsappQR;