export const protect = (req, res, next) => {
  if (req.session && req.session.user) {
    next(); // session exists, proceed
  } else {
    return res.status(401).json({ message: "Not authenticated" });
  }
};


export const adminOnly = (req, res, next) => {
  if (req.session.user.role === "admin") {
    next(); // proceed
  } else {
    return res.status(403).json({ message: "Admin access only" });
  }
};