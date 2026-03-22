import { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import './Login.css';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [glitchText, setGlitchText] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // 粒子动画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }[] = [];

    const colors = ['#00f0ff', '#00ff88', '#8b5cf6', '#3b82f6'];

    // 创建粒子
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // 连接线
    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(5, 10, 28, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      });

      drawLines();
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 文字故障效果
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchText(Math.random() > 0.95);
      setTimeout(() => setGlitchText(false), 100);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('登录成功');
      navigate('/dashboard');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || '登录失败';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <canvas ref={canvasRef} className="particles-canvas" />

      <div className="scanlines">
        <div className="scanline" />
        <div className="scanline" />
        <div className="scanline" />
        <div className="scanline" />
        <div className="scanline" />
        <div className="scanline" />
        <div className="scanline" />
        <div className="scanline" />
        <div className="scan-flicker" />
      </div>

      <div className="grid-overlay" />

      <div className="login-box">
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />

        <div className="login-header">
          <div className="logo-container">
            <div className="logo-hex">
              <span className="logo-icon">⚡</span>
            </div>
          </div>
          <h1 className={`title ${glitchText ? 'glitch' : ''}`} data-text="ERP QUANTUM">
            ERP QUANTUM
          </h1>
          <p className="subtitle">量子智能查询系统</p>
        </div>

        <Form onFinish={onFinish} className="login-form" layout="vertical" size="large">
          <div className="input-wrapper">
            <div className="input-glow" />
            <UserOutlined className="input-icon" />
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                className="cyber-input"
                placeholder="USER NAME"
                autoComplete="off"
              />
            </Form.Item>
          </div>

          <div className="input-wrapper">
            <div className="input-glow" />
            <LockOutlined className="input-icon" />
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                className="cyber-input"
                placeholder="ACCESS CODE"
              />
            </Form.Item>
          </div>

          <Form.Item>
            <div className="button-container">
              <div className="button-glow" />
              <Button
                className="cyber-button"
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                <span className="button-text">AUTHENTICATE</span>
                <span className="button-glitch" />
              </Button>
            </div>
          </Form.Item>

          <div className="corner-accent top-left" />
          <div className="corner-accent top-right" />
          <div className="corner-accent bottom-left" />
          <div className="corner-accent bottom-right" />
        </Form>

        <div className="login-footer">
          <div className="data-stream">
            <span>SYS://QUANTUM_CORE_v2.4.7</span>
            <span className="blinking">●</span>
            <span>ENCRYPTED</span>
          </div>
          <p className="default-account">默认账号: admin / admin123</p>
        </div>
      </div>

      <div className="ambient-lines">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="ambient-line" style={{ '--i': i } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}
