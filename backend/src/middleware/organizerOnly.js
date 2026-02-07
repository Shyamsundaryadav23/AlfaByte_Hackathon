export const organizerOnly = (req, res, next) => {
  const role = req.user?.role;
  if (!role || !["President", "Secretary", "Member"].includes(role)) {
    return res.status(403).json({ error: "Organizer access only" });
  }
  next();
};
