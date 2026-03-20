import session from 'express-session';

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'erp-query-agent-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
});
