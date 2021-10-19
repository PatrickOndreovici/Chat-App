const jwt = require("jsonwebtoken");
const verify = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["x-access-token"]
    if (!token){
        return res.status(403).json({message: "Auth denied"})
    }
    try{
        const decoded = jwt.verify(token, "akafdafadm,gf;lafdmgh;ladmfgh;lfam")
    }catch(err){
        return res.status(401).json({message: "Invalid token"})
    }
}

module.exports = verify