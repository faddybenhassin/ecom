import mongoose from 'mongoose'

// 1. Define the OIDC Provider Sub-schema
const OidcMethodSchema = new mongoose.Schema({
  provider: { 
    type: String, 
    required: true,
    enum: ['google', 'github', 'okta', 'auth0', 'keycloak'] // Add the providers you support
  },
  provider_user_id: { 
    type: String, 
    required: true 
  }
}, { _id: false }); // Disable _id generation for subdocuments to save space

// 2. Define the Local/Manual Auth Sub-schema
const LocalMethodSchema = new mongoose.Schema({
  password_hash: { 
    type: String, 
    required: true 
  }
}, { _id: false });

// 3. Define the Main User Schema
const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    lowercase: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  role:     { 
    type: String, 
    enum: ["user", "admin"], 
    default: "user" 
    },
  auth_methods: {
    local: { 
      type: LocalMethodSchema, 
      default: null 
    },
    oidc: { 
      type: [OidcMethodSchema], 
      default: [] 
    }
  }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

// ==========================================
// 4. CRITICAL INDEXES
// ==========================================

// Compound unique index for OIDC. Ensures a single external account 
// (e.g., Google user ID '123') can only map to exactly one user in your system.
UserSchema.index(
  { "auth_methods.oidc.provider": 1, "auth_methods.oidc.provider_user_id": 1 },
  { 
    unique: true, 
    partialFilterExpression: { "auth_methods.oidc.0": { $exists: true } } 
  }
);

// Regular index on email for ultra-fast lookups during manual login
// UserSchema.index({ email: 1 });



// ==========================================
// 5. HELPER STATIC METHODS (Optional but Helpful)
// ==========================================

// Helper to find a user by their OIDC credentials
UserSchema.statics.findByOidc = function(provider, providerUserId) {
  return this.findOne({
    "auth_methods.oidc.provider": provider,
    "auth_methods.oidc.provider_user_id": providerUserId
  });
};

// Helper to find a user by email for manual login
UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};


export const User = mongoose.model('User', UserSchema);
