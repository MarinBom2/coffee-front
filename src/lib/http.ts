import axios from 'axios';

// .env 파일의 설정값을 읽어옵니다.
const origin = import.meta.env.VITE_API_ORIGIN || 'http://localhost:9090';
const prefix = import.meta.env.VITE_API_PREFIX || '/client/api/v1';

export const client = axios.create({
    baseURL: `${origin}${prefix}`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:9090/ws-stomp';
