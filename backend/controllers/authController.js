import express from 'express'
import crypto from 'crypto'
import oidcConfig from '../config/oidc.js';
import * as oidc from 'openid-client'
import { User } from '../models/Users.js';
import bcrypt from 'bcrypt'
const REDIRECT_URI = 'http://localhost:3000/auth/google/callback';
const FRONTEND_REDIRECT_URI = 'http://localhost:5173/dashboard';




export async function googleRedirect(req, res){
    const code_verifier = oidc.randomPKCECodeVerifier();
    const code_challenge = await oidc.calculatePKCECodeChallenge(code_verifier);
    const state = oidc.randomState();

    req.session.pkce = { code_verifier, state };

    const authorizationUrl = oidc.buildAuthorizationUrl(oidcConfig, {
        redirect_uri: REDIRECT_URI,
        scope: 'openid profile email',
        state,
        code_challenge,
        code_challenge_method: 'S256',
    });

    // Redirect the user to the IdP login screen
    res.redirect(authorizationUrl.href);

    
}




async function handleOidcCallback(req, res, provider, {sub, email, name}){
    let user = await User.findByOidc(provider, sub);
    // the user is already logged in with this provider
    if(!user){
        user = await User.findByEmail(email);

        if (user) {
            // The email exists (they likely signed up manually in the past). 
            // Link this new OIDC provider to their existing profile.
            user.auth_methods.oidc.push({
                provider: provider,
                provider_user_id: sub
            });
            await user.save();
        } else {
            // the user needs a new account
            user = new User({
                email: email,
                display_name: name,
                auth_methods: {
                    local: null, // They don't have a local password yet
                    oidc: [{
                        provider: provider,
                        provider_user_id: sub
                    }]
                }
            });

            await user.save();
        }
    }
    



    req.session.user = {
        id: user._id,
        email: user.email,
        name: user.display_name,
        role: user.role
    };

    await new Promise((resolve, reject) => {
        req.session.save((saveError) => {
            if (saveError) {
                // This triggers the 'catch (error)' block below
                return reject(saveError); 
            }
            // This lets the code move on to line 47 (the redirect)
            resolve(); 
        });
    });

    return res.redirect(FRONTEND_REDIRECT_URI);
}


export async function googleCallback(req, res){
    const storedPkce = req.session.pkce;
    if (!storedPkce) {
        return res.status(400).send('Session expired or invalid login attempt.');
    }
    try {
        const currentUrl = new URL(req.originalUrl, `http://${req.headers.host}`);
    
        // 2. Process the grant using your session variables
        const tokenSet = await oidc.authorizationCodeGrant(
          oidcConfig,       // Your v6 configuration object
          currentUrl,   // The live URL containing Google's response
          {
            // Verify the state sent by Google matches your session state
            expectedState: req.session.pkce.state,
            
            // Pass the verifier so v6 can decrypt/verify the authorization code
            pkceCodeVerifier: req.session.pkce.code_verifier,
            
            
            idTokenExpectedRedirectUri: REDIRECT_URI,
          }
        );
    
        delete req.session.pkce;
        const claims = tokenSet.claims();

        if (!claims) {
            throw new Error('No ID Token claims found in the token response.');
        }

        

        return await handleOidcCallback(req,res, "google", claims)

    } catch (error) {
        delete req.session.pkce;


        console.error('PKCE Callback Verification Failed:', error);
        return res.status(500).send('Authentication failed.');
    }

}







export function logout(req, res) {
    req.session.destroy((destroyError) => {
        if (destroyError) {
            console.error('Logout failed:', destroyError);
            return res.status(500).send('Logout failed.');
        }

        res.clearCookie('connect.sid', { path: '/' });
        return res.status(200).json({ message: 'Logged out successfully.' });
    });
}










export async function login(req, res){
    try {
        const {email, password} = req.body;

        // 1. Check if the email doesnt exist
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        const hashedPassword = user.auth_methods?.local?.password_hash;
        // if hashedPasswrod doesnt exist and account exists it means we logged in with ocid
        if(!hashedPassword){
            return res.status(401).json({ error: "Invalid email or password." });
        }
        //compare passwords and login
        const isMatch = await bcrypt.compare(password, hashedPassword);


        if(!isMatch){
            return res.status(401).json({error:"Invalid email or password."})
        }

        req.session.user = {
            id: user._id,
            email: user.email,
            name: user.display_name,
            role: user.role
        };

        await new Promise((resolve, reject) => {
            req.session.save((saveError) => {
                if (saveError) {
                    // This triggers the 'catch (error)' block below
                    return reject(saveError); 
                }
                // This lets the code move on to line 47 (the redirect)
                resolve(); 
            });
        }); 

        return res.status(200).json({
            message:"user signed in successfuly",
            user:{
                id: user._id,
                email: user.email,
                name: user.display_name,
                role: user.role
            }
        });



    } catch (error) {
        console.error("Sign-in error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function register(req,res){
    try {
        const { email, password, displayName } = req.body;

        // 1. Check if the email is already registered using our helper
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "Email is already taken." });
        }

        // 2. Hash the password safely
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 3. Create and Save the user
        const newUser = new User({
            email: email,
            display_name: displayName,
            auth_methods: {
                local: {
                password_hash: hashedPassword
                },
                oidc: []
            }
        });
        
        await newUser.save();

        req.session.user = {
          id: newUser._id,
          email: newUser.email,
          name: newUser.display_name,
          role: newUser.role
        };

        await new Promise((resolve, reject) => {
            req.session.save((saveError) => {
                if (saveError) {
                    // This triggers the 'catch (error)' block below
                    return reject(saveError); 
                }
                // This lets the code move on to line 47 (the redirect)
                resolve(); 
            });
        });

        return res.status(201).json({
            message:"user signed up successfuly",
            user:{
                id: newUser._id,
                email: newUser.email,
                name: newUser.display_name,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Sign-up error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}




// auth with github


export async function githubRedirect(req,res){
    const state = crypto.randomBytes(16).toString('hex');
    req.session.oauthState = state;

    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_uri: 'http://localhost:3000/auth/github/callback',
        scope: 'read:user user:email',
        state
    });

    res.redirect(`https://github.com/login/oauth/authorize?${params}`);
};

export async function githubCallback (req,res){
    const {code, state} = req.query;

    if(state !== req.session.oauthState){
        return res.status(403).send('State mismatch. Possible CSRF attack.');
    }

      // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: 'http://localhost:3000/auth/github/callback'
        })
    });

    const { access_token } = await tokenRes.json();

    // Get user info from GitHub
    const userRes = await fetch('https://api.github.com/user', {
        headers: {
        Authorization: `Bearer ${access_token}`,
        'User-Agent': 'oauth-prototype'
        }
    });

    const githubUser = await userRes.json();


    const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: {
            Authorization: `Bearer ${access_token}`,
            'User-Agent': 'oauth-prototype'
        }
    });
    const emailData = await emailRes.json();
    
    const primaryEmailObj = emailData.find(email => email.primary === true);
    const email = primaryEmailObj ? primaryEmailObj.email : null;

    const payload = {
        sub: String(githubUser.id),
        email,
        name: githubUser.name || githubUser.login
    }

    return await handleOidcCallback(req, res, "github", payload)
};









export async function updateUserRole(req, res) {
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { role } },
    { new: true }
  ).select("_id email display_name role");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ user, message:"role updated"});
};