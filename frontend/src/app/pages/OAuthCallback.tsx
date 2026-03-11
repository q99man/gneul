import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

/**
 * 소셜 로그인 OAuth 콜백 페이지.
 * URL의 token(또는 access_token) 쿼리를 꺼내 localStorage에 저장한 뒤 홈으로 이동합니다.
 */
export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("로그인 처리 중...");

  useEffect(() => {
    const token = searchParams.get("token") ?? searchParams.get("access_token");
    if (token) {
      localStorage.setItem("token", token);
      window.dispatchEvent(new CustomEvent("auth-login"));
      setStatus("success");
      setMessage("로그인 성공");
      const t = setTimeout(() => navigate("/", { replace: true }), 1500);
      return () => clearTimeout(t);
    } else {
      setStatus("error");
      setMessage("토큰을 받지 못했습니다.");
    }
  }, [searchParams, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
      }}
    >
      {status === "loading" && <p>{message}</p>}
      {status === "success" && (
        <div className="px-6 py-4 rounded-2xl bg-gray-900 text-white text-center font-medium shadow-lg">
          {message}
        </div>
      )}
      {status === "error" && (
        <>
          <p>{message}</p>
          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            style={{
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
          >
            홈으로
          </button>
        </>
      )}
    </div>
  );
}
