import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Box, Typography, Button, TextField, Grid, Paper, LinearProgress, Divider, Chip } from '@mui/material';
import { WS_URL, client } from '@/lib/http';
import { Coffee, SettingsInputComponent, ShutterSpeed, Terminal, Tune, PlayArrow } from '@mui/icons-material';

const DashboardPage = () => {
    const [weight, setWeight] = useState(0);
    const [status, setStatus] = useState('IDLE');
    const [activeMotor, setActiveMotor] = useState('NONE');
    const [logs, setLogs] = useState<string[]>([]);
    const [order, setOrder] = useState({
        totalWeight: 20,
        ra: 60,
        rb: 20,
        rc: 20,
        rpm: 1000,
        blendTime: 2
    });

    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    useEffect(() => {
        const stompClient = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            reconnectDelay: 5000,
            onConnect: () => {
                stompClient.subscribe('/topic/scale', (message) => {
                    const data = JSON.parse(message.body);
                    setWeight(data.currentWeight);
                    setStatus(data.status);
                    setActiveMotor(data.activeMotor);
                    if (data.message) {
                        setLogs(prev => [...prev, data.message]);
                    }
                });
            },
        });
        stompClient.activate();
        return () => stompClient.deactivate();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = value === '' ? 0 : parseFloat(value);
        setOrder(prev => ({
            ...prev,
            [name]: numValue < 0 ? 0 : numValue
        }));
    };

    const handleStart = async () => {
        if (order.totalWeight <= 0) {
            alert("목표 무게는 0보다 커야 합니다.");
            return;
        }
        const totalRatio = order.ra + order.rb + order.rc;
        if (Math.abs(totalRatio - 100) > 0.01) {
            alert(`비율 합계가 ${totalRatio}%입니다. 100%를 맞춰주세요.`);
            return;
        }
        setWeight(0);
        setLogs(["[시스템] 제조 공정 시작 요청..."]);
        try {
            await client.post('/coffee/make', order);
        } catch (e) {
            setLogs(prev => [...prev, "!! SERVER ERROR: 통신 실패"]);
        }
    };

    const isProcessing = status !== 'IDLE' && status !== 'COMPLETED';

    return (
        <Box sx={{ p: 4, bgcolor: '#f4f7f9', minHeight: '100vh' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Coffee color="primary" fontSize="large" />
                SMART COFFEE CONTROL
                <Chip label="v1.3.8" color="primary" variant="outlined" sx={{ fontWeight: 'bold' }} />
            </Typography>

            <Grid container spacing={3}>
                {/* [왼쪽 섹션: 하드웨어 가상화 및 설정] */}
                <Grid item xs={12} md={7}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                        {/* 1. 하드웨어 가상화 패널 (도면 81, 83, 84번) */}
                        <Paper sx={{ p: 4, borderRadius: 6, bgcolor: '#fff', boxShadow: 3 }}>
                            <Grid container spacing={3} justifyContent="center">

                                {/* Hopper 섹션: 크기 확장 및 디자인 개선 */}
                                <Grid item xs={12}>
                                    <Grid container spacing={2}>
                                        {['A', 'B', 'C'].map((m) => (
                                            <Grid item xs={4} key={m}>
                                                <Box sx={{
                                                    p: 3, borderRadius: 5, border: '2px solid', textAlign: 'center',
                                                    minHeight: '180px', display: 'flex', flexDirection: 'column',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    borderColor: activeMotor === m ? '#ff9800' : '#f0f0f0',
                                                    bgcolor: activeMotor === m ? '#fffdfa' : 'transparent',
                                                    boxShadow: activeMotor === m ? '0 8px 20px rgba(255,152,0,0.15)' : 'none',
                                                    transition: 'all 0.3s ease'
                                                }}>
                                                    <SettingsInputComponent sx={{ fontSize: 55, color: activeMotor === m ? '#ff9800' : '#cbd5e0', mb: 1 }} />
                                                    <Typography variant="h6" fontWeight="bold">Hopper {m}</Typography>
                                                    <Chip
                                                        label={activeMotor === m ? "OPEN" : "CLOSED"}
                                                        size="small"
                                                        sx={{
                                                            mt: 1, fontWeight: 'bold',
                                                            bgcolor: activeMotor === m ? '#ff9800' : '#e2e8f0',
                                                            color: activeMotor === m ? '#white' : '#64748b'
                                                        }}
                                                    />
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Grid>

                                <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                                {/* 블렌더 & 그라인더 섹션: 너비 및 시각 효과 유지 */}
                                <Grid item xs={6}>
                                    <Box
                                        className={activeMotor === 'BLENDER' ? 'neon-glow-blue' : ''}
                                        sx={{
                                            py: 4, px: 2, borderRadius: 5, border: '2px solid #f0f0f0', textAlign: 'center',
                                            minHeight: '200px', display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s'
                                        }}
                                    >
                                        <ShutterSpeed
                                            className={activeMotor === 'BLENDER' ? 'blender-spinning' : ''}
                                            sx={{ fontSize: 70, color: activeMotor === 'BLENDER' ? '#2196f3' : '#cbd5e0' }}
                                        />
                                        <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold', color: activeMotor === 'BLENDER' ? '#2196f3' : '#64748b' }}>
                                            BLENDER
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={6}>
                                    <Box
                                        className={activeMotor === 'GRINDER' ? 'neon-glow-purple' : ''}
                                        sx={{
                                            py: 4, px: 2, borderRadius: 5, border: '2px solid #f0f0f0', textAlign: 'center',
                                            minHeight: '200px', display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s'
                                        }}
                                    >
                                        <Coffee
                                            className={activeMotor === 'GRINDER' ? 'grinder-active' : ''}
                                            sx={{ fontSize: 70, color: activeMotor === 'GRINDER' ? '#9c27b0' : '#cbd5e0' }}
                                        />
                                        <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold', color: activeMotor === 'GRINDER' ? '#9c27b0' : '#64748b' }}>
                                            GRINDER
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* 2. 레시피 및 공정 제어 패널 */}
                        <Paper sx={{ p: 4, borderRadius: 6, boxShadow: 5 }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Tune color="primary" /> Recipe & Control Panel
                            </Typography>
                            <Grid container spacing={2.5}>
                                <Grid item xs={4}>
                                    <TextField
                                        fullWidth label="Total Weight(g)" name="totalWeight" type="number"
                                        value={order.totalWeight === 0 ? '' : order.totalWeight}
                                        onChange={handleInputChange} disabled={isProcessing}
                                        inputProps={{ min: 0, step: "0.1" }}
                                    />
                                </Grid>
                                <Grid item xs={4}><TextField fullWidth label="Blender RPM" name="rpm" type="number" value={order.rpm === 0 ? '' : order.rpm} onChange={handleInputChange} disabled={isProcessing} /></Grid>
                                <Grid item xs={4}><TextField fullWidth label="Mix Time(sec)" name="blendTime" type="number" value={order.blendTime === 0 ? '' : order.blendTime} onChange={handleInputChange} disabled={isProcessing} /></Grid>
                                <Grid item xs={4}><TextField fullWidth label="Bean A (%)" name="ra" type="number" value={order.ra === 0 ? '' : order.ra} onChange={handleInputChange} disabled={isProcessing} /></Grid>
                                <Grid item xs={4}><TextField fullWidth label="Bean B (%)" name="rb" type="number" value={order.rb === 0 ? '' : order.rb} onChange={handleInputChange} disabled={isProcessing} /></Grid>
                                <Grid item xs={4}><TextField fullWidth label="Bean C (%)" name="rc" type="number" value={order.rc === 0 ? '' : order.rc} onChange={handleInputChange} disabled={isProcessing} /></Grid>
                            </Grid>
                            <Divider sx={{ my: 4 }} />
                            <Button
                                fullWidth variant="contained" size="large" startIcon={<PlayArrow />}
                                onClick={handleStart} disabled={isProcessing}
                                sx={{ py: 2.2, borderRadius: 4, fontWeight: 900, fontSize: '1.4rem', boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)' }}
                            >
                                {isProcessing ? 'SYSTEM PROCESSING...' : 'START PRODUCTION'}
                            </Button>
                        </Paper>
                    </Box>
                </Grid>

                {/* [오른쪽 섹션: 모니터링 및 로그] */}
                <Grid item xs={12} md={5}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                        {/* 저울 피드백 (도면 82번) */}
                        <Paper sx={{ p: 4, borderRadius: 6, textAlign: 'center', bgcolor: '#1e293b', color: '#fff', boxShadow: 10 }}>
                            <Typography variant="overline" sx={{ color: '#10b981', fontWeight: 'bold', letterSpacing: 1.5 }}>
                                REAL-TIME SCALE FEEDBACK (82)
                            </Typography>
                            <Typography variant="h1" sx={{ fontWeight: 900, my: 1.5, letterSpacing: -2 }}>
                                {weight.toFixed(2)}<small style={{ fontSize: '1.2rem', marginLeft: '5px', color: '#94a3b8' }}>g</small>
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min((weight / order.totalWeight) * 100, 100)}
                                sx={{ height: 14, borderRadius: 7, bgcolor: '#334155', '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }}
                            />
                        </Paper>

                        {/* 프로세스 터미널 */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold', color: '#475569' }}>
                                <Terminal fontSize="small" /> LIVE PROCESS TERMINAL
                            </Typography>
                            <div className="terminal-window" ref={logContainerRef} style={{ height: '560px', overflowY: 'auto' }}>
                                {logs.map((log, i) => {
                                    let className = "";
                                    if (log.includes("---")) className = "log-highlight-yellow";
                                    if (log.includes(">>>")) className = "log-highlight-green";
                                    if (log.includes("완료") || log.includes("배출")) className = "log-info";
                                    return <div key={i} style={{ marginBottom: '6px' }}><span className={className}>{log}</span></div>;
                                })}
                            </div>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
