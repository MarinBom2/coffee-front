import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// 백엔드 개발자가 선호하는 깔끔한 다크/라이트 테마 설정
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2', // 커피 시스템의 신뢰감을 주는 블루
        },
        secondary: {
            main: '#795548', // 원두 색상인 브라운
        },
    },
});

function App({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline /> {/* 브라우저 기본 스타일 초기화 (Normalize) */}
            {children}
        </ThemeProvider>
    );
}

export default App;
