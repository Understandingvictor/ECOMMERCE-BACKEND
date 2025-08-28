import jwt from 'jsonwebtoken'

const verifyUser = async (req, res, next) => {
  let pictures;
  try {
    const cookie = req.cookies;
    pictures = req.files; //grabs files
    
    if (!cookie?.token) {
      const error = new Error("session expired, pls login");
      error.status = 401;
      //when theres error checking if picture exists in request and then remove it
      if (pictures) {
        if (pictures?.length !== 0) {
          for (let i of pictures) {
            await fs.unlink(i.path);
          }
        }
      }
      throw error;
    }
    const token = cookie.token; //actual token
    jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
      if (error) {
        const err = new Error("Invalid token");
        err.status = 401;
        throw error;
      }
      req.user = { userId: decoded.userId };
      next();
    });
  } catch (error) {
    next(error);
  }
};
export default verifyUser;