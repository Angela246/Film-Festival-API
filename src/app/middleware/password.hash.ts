import * as bcrypt from 'bcrypt';

const hash = async(password:string)=>{
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password,salt);
}

const checkPassword= async(password:string, hashedPassword:string)=>{
    return bcrypt.compareSync(password, hashedPassword);
}

export{hash,checkPassword}