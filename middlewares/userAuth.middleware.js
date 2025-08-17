import jwt from 'jsonwebtoken'

const verifyUser = (req, res, next)=>{
    try {
        const cookie = req.cookies;

        if(!cookie){
            const error = new Error("session expired, pls login");
            error.status = 401;
            throw error;
        }
        const token = cookie.token; //actual token
        jwt.verify(token, process.env.SECRET_KEY, (error, decoded)=>{
            if(error){
                const err = new Error("Invalid token");
                err.status = 401;
                throw error;
            }
            req.user = {userId:decoded.userId};
            next();
        })   
        
    } catch (error) {
        next(error);
    }
}
export default verifyUser;