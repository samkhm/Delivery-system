const jwt = require("jsonwebtoken");

exports.protect = async (req, res, next) => {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Unauthorized!!"
        });
    }

    const token = auth.split("Bearer ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Unauthorized!"
            });
        }

        next();
    };
};