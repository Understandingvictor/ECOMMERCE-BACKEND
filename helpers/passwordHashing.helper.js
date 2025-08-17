import bcrypt from "bcryptjs";
    
const hashPassword =(password)=>{
    const salt = bcrypt.genSaltSync(10); //pasword hashing using bycrypt;
    const hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword;
}

const unhashPassword = (inputPassword, dbPassword) => {
  const isCorrectPassword = bcrypt.compareSync(inputPassword, dbPassword); // true
  return isCorrectPassword;
};
export  {hashPassword, unhashPassword};