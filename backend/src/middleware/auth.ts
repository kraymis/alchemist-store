import { NextFunction, Request, Response } from 'express'; import jwt from 'jsonwebtoken'
export interface AuthRequest extends Request { admin?: { id: string; username: string } }
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) { const token = req.headers.authorization?.replace('Bearer ', ''); if (!token) return res.status(401).json({ message: 'Authentication required' }); try { req.admin = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; username: string }; next() } catch { res.status(401).json({ message: 'Invalid or expired token' }) } }
