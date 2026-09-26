import React, { useState } from 'react'
import { Ico, toast } from '../components/UI.jsx'
import { authAPI } from '../api.js'
import Landing from './Landing.jsx'

const ROLE_HINTS = {
  admin:   { email: 'admin@coreinventory.com',   password: 'admin123',   label: 'Administrator',  color: '#00f0ff',  bg: 'rgba(0,240,255,.1)',  border: 'rgba(0,240,255,.3)',  icon: 'shield'   },
  manager: { email: 'manager@coreinventory.com', password: 'manager123', label: 'Manager',        color: '#a78bfa',  bg: 'rgba(167,139,250,.1)',border: 'rgba(167,139,250,.3)', icon: 'activity' },
  staff:   { email: 'staff@coreinventory.com',   password: 'staff123',   label: 'Warehouse Staff',color: '#10b981',  bg: 'rgba(16,185,129,.1)', border: 'rgba(16,185,129,.3)',  icon: 'box'      },
}

export default function Auth({ onLogin }) {
  const [view,   setView]  = useState('landing')
  const [role,   setRole]  = useState(null)
  const [step,   setStep]  = useState(1)
  const [busy,   setBusy]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [f, setF] = useState({ email:'', password:'', name:'', otp:'', newPass:'' })
  const h = e => setF(x => ({ ...x, [e.target.name]: e.target.value }))

  const handleSelectRole = (roleKey) => {
    if (roleKey === 'login') {
      setRole(null)
      setF(x => ({ ...x, email:'', password:'' }))
    } else {
      setRole(roleKey)
      const hint = ROLE_HINTS[roleKey]
      setF(x => ({ ...x, email: hint.email, password: hint.password }))
    }
    setView('login')
    setStep(1)
  }

  const submit = async () => {
    if (busy) return
    setBusy(true)
    try {
      if (view === 'login') {
        if (!f.email || !f.password) { toast('Please fill in both email and password', 'e'); return }
        const res = await authAPI.login(f.email, f.password)
        onLogin({ id:res.user.id, name:res.user.name, email:res.user.email, role:res.user.role, av:res.user.avatar }, res.token)
      } else if (view === 'signup') {
        if (!f.name || !f.email || !f.password) { toast('Please fill in all fields', 'e'); return }
        const res = await authAPI.signup(f.name, f.email, f.password)
        onLogin({ id:res.user.id, name:res.user.name, email:res.user.email, role:res.user.role, av:res.user.avatar }, res.token)
      } else {
        if (step === 1) {
          if (!f.email) { toast('Enter your registered email', 'e'); return }
          const res = await authAPI.sendOtp(f.email)
          toast(res.message || 'OTP sent to your email!', 's')
          if (res.devOtp) toast('DEV OTP CODE: ' + res.devOtp, 'w')
          setStep(2)
        } else if (step === 2) {
          if (!f.otp) { toast('Enter the 6-digit OTP', 'e'); return }
          const res = await authAPI.verifyOtp(f.email, f.otp)
          setResetToken(res.resetToken)
          toast('OTP verified successfully! Set a new password.')
          setStep(3)
        } else {
          if (!f.newPass || f.newPass.length < 6) { toast('Password must be at least 6 characters', 'e'); return }
          await authAPI.resetPass(resetToken, f.newPass)
          toast('Password reset successfully! Please sign in.')
          setView('login'); setStep(1)
        }
      }
    } catch(err) {
      toast(err.message || 'Something went wrong', 'e')
    } finally {
      setBusy(false)
    }
  }

  if (view === 'landing') {
    return <Landing onSelectRole={handleSelectRole}/>
  }

  const roleHint = role ? ROLE_HINTS[role] : null

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: 'var(--bg0)', position: 'relative', overflow: 'hidden', padding: 20
    }}>
      {/* Background glow orbs */}
      <div style={{ position:'absolute', top:'10%', left:'5%', width:400, height:400, background:'radial-gradient(circle,rgba(0,240,255,.08),transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'10%', right:'5%', width:450, height:450, background:'radial-gradient(circle,rgba(167,139,250,.07),transparent 70%)', pointerEvents:'none' }}/>

      {/* Return to home button */}
      <button
        onClick={() => setView('landing')}
        className="btn bs bsm"
        style={{ position:'fixed', top:24, left:24, zIndex:10 }}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        <span>Back to Portal</span>
      </button>

      {/* Auth Card */}
      <div className="card scale-in" style={{ width: '100%', maxWidth: 420, padding: 32, boxShadow: '0 25px 60px rgba(0,0,0,.5)' }}>
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 50, height: 50,
            background: 'linear-gradient(135deg, var(--cy), #0284c7, var(--pu))',
            borderRadius: 14, display: 'grid', placeItems: 'center', margin: '0 auto 12px',
            boxShadow: '0 0 25px rgba(0, 240, 255, 0.4)', animation: 'glow 3s infinite alternate'
          }}>
            <Ico n="archive" size={24} color="white" stroke={2.2}/>
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--t0)' }}>
            Core<span style={{ color: 'var(--cy)' }}>Inventory</span>
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--t2)', marginTop: 4, letterSpacing: '.12em', fontWeight: 700 }}>
            SECURE ACCESS GATEWAY
          </div>
        </div>

        {/* Selected Role Indicator Banner */}
        {roleHint && view === 'login' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: roleHint.bg, border: `1px solid ${roleHint.border}`,
            borderRadius: 10, padding: '10px 14px', marginBottom: 18
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: `${roleHint.color}25`,
              display: 'grid', placeItems: 'center', border: `1px solid ${roleHint.border}`, flexShrink: 0
            }}>
              <Ico n={roleHint.icon} size={16} color={roleHint.color}/>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: roleHint.color }}>{roleHint.label} Portal</div>
              <div style={{ fontSize: 10.5, color: 'var(--t2)' }}>Demo credentials pre-loaded</div>
            </div>
          </div>
        )}

        {/* Tabs for Sign In vs Sign Up */}
        {view !== 'otp' && (
          <div className="tabs" style={{ marginBottom: 20 }}>
            <div
              className={'tab' + (view==='login'?' act':'')}
              style={{ flex: 1, textAlign: 'center' }}
              onClick={() => setView('login')}
            >
              Sign In
            </div>
            <div
              className={'tab' + (view==='signup'?' act':'')}
              style={{ flex: 1, textAlign: 'center' }}
              onClick={() => { setView('signup'); setRole(null); setF(x => ({ ...x, email:'', password:'', name:'' })) }}
            >
              Sign Up
            </div>
          </div>
        )}

        {/* ── LOGIN FORM ── */}
        {view === 'login' && (
          <>
            <div className="fg">
              <label className="lbl">Email Address</label>
              <input
                className="inp"
                name="email"
                type="email"
                value={f.email}
                onChange={h}
                placeholder="user@coreinventory.com"
              />
            </div>

            <div className="fg">
              <div className="fcb" style={{ marginBottom: 6 }}>
                <label className="lbl" style={{ marginBottom: 0 }}>Password</label>
                <span
                  style={{ fontSize: 11.5, color: 'var(--cy)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => { setView('otp'); setStep(1) }}
                >
                  Forgot password?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  className="inp"
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={f.password}
                  onChange={h}
                  placeholder="Enter your password"
                  onKeyDown={e => e.key === 'Enter' && submit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', color: 'var(--t2)', cursor: 'pointer', display: 'flex'
                  }}
                  title={showPass ? "Hide password" : "Show password"}
                >
                  <Ico n={showPass ? "eye" : "lock"} size={14}/>
                </button>
              </div>
            </div>

            <button
              className="btn bp"
              style={{ width: '100%', justifyContent: 'center', padding: 11, fontSize: 13.5 }}
              onClick={submit}
              disabled={busy}
            >
              {busy ? 'Verifying...' : 'Sign in to Dashboard'}
            </button>

            {/* Quick 1-Click Demo Accounts */}
            <div style={{
              marginTop: 18, padding: '12px 14px', background: 'var(--bg0)',
              borderRadius: 10, border: '1px solid var(--b0)'
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', marginBottom: 8, letterSpacing: '.04em' }}>
                QUICK DEMO ACCOUNTS (1-CLICK FILL):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(ROLE_HINTS).map(([key, r]) => (
                  <div
                    key={key}
                    onClick={() => { setRole(key); setF(x => ({ ...x, email:r.email, password:r.password })) }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 10px', borderRadius: 7, cursor: 'pointer',
                      background: role === key ? r.bg : 'var(--bg1)',
                      border: `1px solid ${role === key ? r.border : 'var(--b0)'}`,
                      transition: '.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Ico n={r.icon} size={13} color={r.color}/>
                      <span style={{ color: r.color, fontWeight: 700, fontSize: 12 }}>{r.label}</span>
                    </div>
                    <span className="mono" style={{ fontSize: 10.5, color: 'var(--t2)' }}>{r.password}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── SIGN UP FORM ── */}
        {view === 'signup' && (
          <>
            <div className="fg">
              <label className="lbl">Full Name</label>
              <input className="inp" name="name" value={f.name} onChange={h} placeholder="e.g. Alex Morgan"/>
            </div>
            <div className="fg">
              <label className="lbl">Work Email</label>
              <input className="inp" name="email" type="email" value={f.email} onChange={h} placeholder="alex@company.com"/>
            </div>
            <div className="fg">
              <label className="lbl">Password</label>
              <input className="inp" name="password" type="password" value={f.password} onChange={h} placeholder="Min 6 characters" onKeyDown={e=>e.key==='Enter'&&submit()}/>
            </div>
            <button
              className="btn bp"
              style={{ width: '100%', justifyContent: 'center', padding: 11, fontSize: 13.5 }}
              onClick={submit}
              disabled={busy}
            >
              {busy ? 'Creating Account...' : 'Create Account'}
            </button>
            <div style={{ marginTop: 14, fontSize: 11.5, color: 'var(--t2)', textAlign: 'center', lineHeight: 1.5 }}>
              New accounts default to <span style={{ color: 'var(--gn)', fontWeight: 700 }}>Warehouse Staff</span>. An administrator can elevate privileges.
            </div>
          </>
        )}

        {/* ── FORGOT / RESET PASSWORD FLOW ── */}
        {view === 'otp' && (
          <>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: 'var(--t0)', marginBottom: 4 }}>
              Reset Password
            </div>
            <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 16 }}>
              {step===1 && 'Enter your registered email to receive a secure OTP code.'}
              {step===2 && `Enter the 6-digit OTP sent to ${f.email}`}
              {step===3 && 'Choose a strong new password for your account.'}
            </div>

            {/* Stepper Progress Bar */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
              {[1, 2, 3].map(n => (
                <div
                  key={n}
                  style={{
                    flex: 1, height: 4, borderRadius: 2,
                    background: step >= n ? 'var(--cy)' : 'var(--b0)',
                    boxShadow: step >= n ? '0 0 8px var(--cy)' : 'none',
                    transition: '.3s'
                  }}
                />
              ))}
            </div>

            {step===1 && (
              <div className="fg">
                <label className="lbl">Registered Email</label>
                <input className="inp" name="email" type="email" value={f.email} onChange={h} placeholder="user@coreinventory.com"/>
              </div>
            )}

            {step===2 && (
              <div className="fg">
                <label className="lbl">6-Digit OTP Code</label>
                <input
                  className="inp"
                  name="otp"
                  value={f.otp}
                  onChange={h}
                  placeholder="000000"
                  maxLength={6}
                  style={{ textAlign: 'center', letterSpacing: '.35em', fontSize: 22, fontFamily: 'JetBrains Mono, monospace', fontWeight: 800 }}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                />
              </div>
            )}

            {step===3 && (
              <div className="fg">
                <label className="lbl">New Password</label>
                <input className="inp" name="newPass" type="password" value={f.newPass} onChange={h} placeholder="Min 6 characters" onKeyDown={e=>e.key==='Enter'&&submit()}/>
              </div>
            )}

            <button
              className="btn bp"
              style={{ width: '100%', justifyContent: 'center', padding: 11 }}
              onClick={submit}
              disabled={busy}
            >
              {busy ? 'Processing...' : step===1 ? 'Send OTP Code' : step===2 ? 'Verify OTP Code' : 'Save New Password'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 14 }}>
              <span
                style={{ fontSize: 12, color: 'var(--cy)', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => { setView('login'); setStep(1) }}
              >
                ← Return to sign in
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
