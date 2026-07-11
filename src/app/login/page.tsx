"use client"

import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Suspense, useState } from "react"
import type { FormEvent } from "react"

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8]" />}>
      <LoginForm />
    </Suspense>
  )
}

const DEFAULT_CALLBACK_URL = "/dashboard"

function getSafeCallbackUrl(callbackUrl: string | null) {
  if (
    !callbackUrl ||
    !callbackUrl.startsWith("/") ||
    callbackUrl.startsWith("//") ||
    callbackUrl.startsWith("/login")
  ) {
    return DEFAULT_CALLBACK_URL
  }

  return callbackUrl
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") || "").trim().toLowerCase()
    const password = String(formData.get("password") || "")

    if (!email || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน")
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
        setIsLoading(false)
      } else {
        router.replace(callbackUrl)
        router.refresh()
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
      setIsLoading(false)
    }
  }

  return (
    <div className="login-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #FAFAF8;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .login-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          max-width: 860px;
          min-height: 520px;
          background: #fff;
          border: 1px solid #E8E5DD;
          border-radius: 4px;
          overflow: hidden;
        }

        /* LEFT PANEL */
        .login-left {
          background: #F5C800;
          padding: 52px 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .login-left::before {
          content: '';
          position: absolute;
          bottom: -60px;
          right: -60px;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: rgba(0,0,0,0.06);
        }

        .login-left::after {
          content: '';
          position: absolute;
          top: 40px;
          right: 40px;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(0,0,0,0.04);
        }

        .brand-mark {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-icon {
          width: 32px;
          height: 32px;
          background: #1A1A1A;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-icon-inner {
          width: 14px;
          height: 14px;
          background: #F5C800;
          border-radius: 2px;
        }

        .brand-name {
          font-size: 15px;
          font-weight: 500;
          color: #1A1A1A;
          letter-spacing: -0.02em;
        }

        .left-headline {
          position: relative;
          z-index: 1;
        }

        .left-headline h1 {
          font-size: 32px;
          font-weight: 300;
          color: #1A1A1A;
          line-height: 1.2;
          letter-spacing: -0.03em;
          margin-bottom: 14px;
        }

        .left-headline h1 strong {
          font-weight: 500;
        }

        .left-headline p {
          font-size: 13px;
          color: rgba(26,26,26,0.6);
          line-height: 1.6;
          max-width: 220px;
        }

        .left-footer {
          font-size: 11px;
          font-family: 'DM Mono', monospace;
          color: rgba(26,26,26,0.45);
          letter-spacing: 0.04em;
          position: relative;
          z-index: 1;
        }

        /* RIGHT PANEL */
        .login-right {
          padding: 52px 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .form-header {
          margin-bottom: 36px;
        }

        .form-header h2 {
          font-size: 20px;
          font-weight: 500;
          color: #1A1A1A;
          letter-spacing: -0.025em;
          margin-bottom: 6px;
        }

        .form-header p {
          font-size: 13px;
          color: #9B9690;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #6B6660;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .input-wrap {
          position: relative;
        }

        .form-input {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #1A1A1A;
          background: #FAFAF8;
          border: 1px solid #E8E5DD;
          border-radius: 3px;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
          -webkit-appearance: none;
        }

        .form-input::placeholder {
          color: #C4C0B8;
        }

        .form-input:focus {
          border-color: #F5C800;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(245,200,0,0.12);
        }

        .input-password {
          padding-right: 44px;
        }

        .toggle-password {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #B0ABA4;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }

        .toggle-password:hover {
          color: #6B6660;
        }

        .form-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          margin-top: 4px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 13px;
          color: #6B6660;
          user-select: none;
        }

        .custom-checkbox {
          width: 16px;
          height: 16px;
          border: 1px solid #D4D0C8;
          border-radius: 3px;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.15s;
        }

        .checkbox-input:checked ~ .checkbox-label .custom-checkbox {
          background: #F5C800;
          border-color: #F5C800;
        }

        .checkbox-input {
          display: none;
        }

        .forgot-link {
          font-size: 13px;
          color: #9B9690;
          text-decoration: none;
          transition: color 0.15s;
        }

        .forgot-link:hover {
          color: #1A1A1A;
        }

        .submit-btn {
          width: 100%;
          height: 44px;
          background: #1A1A1A;
          color: #fff;
          border: none;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: -0.01em;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover {
          background: #2D2D2D;
        }

        .submit-btn:active {
          transform: scale(0.99);
        }

        .submit-btn:disabled {
          background: #C4C0B8;
          cursor: not-allowed;
          transform: none;
        }

        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-msg {
          background: #FEF3F2;
          border: 1px solid #FECACA;
          border-radius: 3px;
          padding: 10px 14px;
          font-size: 13px;
          color: #C0392B;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #E8E5DD;
        }

        .divider-text {
          font-size: 11px;
          color: #C4C0B8;
          letter-spacing: 0.06em;
        }

        .signup-row {
          text-align: center;
          font-size: 13px;
          color: #9B9690;
        }

        .signup-link {
          color: #1A1A1A;
          font-weight: 500;
          text-decoration: none;
          border-bottom: 1px solid #E8E5DD;
          padding-bottom: 1px;
          transition: border-color 0.15s;
        }

        .signup-link:hover {
          border-color: #F5C800;
        }

        @media (max-width: 620px) {
          .login-wrapper {
            grid-template-columns: 1fr;
            max-width: 400px;
          }
          .login-left {
            padding: 36px 32px;
            min-height: auto;
          }
          .left-headline h1 { font-size: 26px; }
          .login-right { padding: 36px 32px; }
          .left-footer { display: none; }
        }
      `}</style>

      <div className="login-wrapper">
        {/* Left decorative panel */}
        <div className="login-left">
          <div className="brand-mark">
                <Image
                    src="/images/logo/logo.png" 
                    alt="Logo" 
                    width={100}
                    height={40} 
                    className="rounded-lg" />
            {/* <span className="brand-name">Welcome</span> */}
          </div>

          <div className="left-headline">
            <h1>
              ยินดี<br />
              ต้อนรับ<br />
              <strong>กลับมา</strong>
            </h1>
            <p>เข้าสู่ระบบเพื่อดำเนินการต่อในพื้นที่ทำงานของคุณ</p>
          </div>

          <div className="left-footer">v2.4.1 · TH</div>
        </div>

        {/* Right form panel */}
        <div className="login-right">
          <div className="form-header">
            <h2>เข้าสู่ระบบ</h2>
            <p>กรอกข้อมูลด้านล่างเพื่อเข้าใช้งาน</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="error-msg" role="alert" aria-live="polite">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6.5" stroke="#C0392B"/>
                  <path d="M7 4v3.5" stroke="#C0392B" strokeWidth="1.2" strokeLinecap="round"/>
                  <circle cx="7" cy="10" r="0.7" fill="#C0392B"/>
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">อีเมล</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="your@email.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">รหัสผ่าน</label>
              <div className="input-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input input-password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
                      <path d="M2 8s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z"/>
                      <circle cx="8" cy="8" r="1.5"/>
                      <path d="M3 3l10 10" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
                      <path d="M2 8s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z"/>
                      <circle cx="8" cy="8" r="1.5"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-meta">
              <label className="checkbox-label">
                <input type="checkbox" className="checkbox-input" name="remember" />
                <div className="custom-checkbox">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                จดจำฉัน
              </label>
              <a href="/forgot-password" className="forgot-link">ลืมรหัสผ่าน?</a>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="btn-spinner" />
                  กำลังเข้าสู่ระบบ
                </>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </form>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">หรือ</span>
            <div className="divider-line" />
          </div>

          <div className="signup-row">
            ยังไม่มีบัญชี?{" "}
            <a href="/register" className="signup-link">สมัครสมาชิก</a>
          </div>
        </div>
      </div>
    </div>
  )
}
