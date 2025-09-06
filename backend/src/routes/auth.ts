import express from 'express';
import { supabase } from '../config/database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// User registration
router.post('/register', async (req: express.Request, res: express.Response) => {
  try {
    const { error: validationError } = registerSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationError.details[0].message 
      });
    }

    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback`
      }
    });

    if (error) {
      return res.status(400).json({ 
        error: 'Registration failed', 
        message: error.message 
      });
    }

    // Check if user needs email confirmation
    if (data.user && !data.session) {
      return res.status(201).json({
        message: 'Registration successful. Please check your email to confirm your account.',
        user: {
          id: data.user.id,
          email: data.user.email,
          emailConfirmed: false
        }
      });
    }

    // User is automatically signed in
    return res.status(201).json({
      message: 'Registration successful',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        emailConfirmed: true
      },
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
router.post('/login', async (req: express.Request, res: express.Response) => {
  try {
    const { error: validationError } = loginSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationError.details[0].message 
      });
    }

    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ 
        error: 'Login failed', 
        message: error.message 
      });
    }

    if (!data.session || !data.user) {
      return res.status(401).json({ 
        error: 'Login failed', 
        message: 'Invalid credentials' 
      });
    }

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        emailConfirmed: data.user.email_confirmed_at !== null
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// User logout
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        // Continue with logout even if Supabase signOut fails
      }
    }

    return res.status(200).json({ 
      message: 'Logout successful' 
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token
router.post('/refresh', async (req: express.Request, res: express.Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ 
        error: 'Refresh token required' 
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error || !data.session) {
      return res.status(401).json({ 
        error: 'Token refresh failed', 
        message: error?.message || 'Invalid refresh token'
      });
    }

    return res.status(200).json({
      message: 'Token refreshed successfully',
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        error: 'Failed to get user profile', 
        message: error?.message 
      });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        emailConfirmed: user.email_confirmed_at !== null,
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Password reset request
router.post('/reset-password', async (req: express.Request, res: express.Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/auth/reset-password`
    });

    if (error) {
      return res.status(400).json({ 
        error: 'Password reset failed', 
        message: error.message 
      });
    }

    return res.status(200).json({
      message: 'Password reset email sent. Please check your inbox.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;