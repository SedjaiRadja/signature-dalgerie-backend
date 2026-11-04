const protectAdmin = (req, res, next) => {
  const apiKey = req.headers["x-admin-key"];

  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({
      message: "Unauthorized. Admin access required.",
    });
  }

  next();
};

module.exports = protectAdmin;