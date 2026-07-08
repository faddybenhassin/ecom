import express from 'express'
import { githubCallback, githubRedirect, googleCallback, googleRedirect, login, logout, register, updateUserRole } from '../controllers/authController.js'
import { protect, adminOnly } from '../middleware/auth.js'


const router = express.Router()


// oidc for google
router.get('/google', googleRedirect)
router.get('/google/callback', googleCallback)


// oauth github that returns user data like oidc
router.get('/github', githubRedirect)
router.get('/github/callback', githubCallback)

// manual login
router.post('/login',login)
router.post('/register',register)
router.post('/logout', logout)


// promote route
router.patch("/users/:id/role", protect, adminOnly, updateUserRole);

export default router