
# Travel Website Design

This is a code bundle for Travel Website Design. The original project is available at https://www.figma.com/design/gVvglQk0eOkm7AGYACMz0k/Travel-Website-Design.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Backend 연결

- **로컬 개발**: `vite.config.ts`에 `/api` → `http://localhost:8080` 프록시가 설정되어 있습니다.
  - 프론트 코드에서 `fetch('/api/...')`로 호출하면 백엔드로 전달됩니다.
- **배포/프록시 없이 호출**: 환경변수 `VITE_API_BASE_URL`을 설정하면 프록시 없이도 호출할 수 있습니다.
  - 예: `VITE_API_BASE_URL=https://api.example.com`


