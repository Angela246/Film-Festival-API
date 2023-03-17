import * as bcrypt from 'bcrypt';

const hash = async(password:string)=>{
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password,salt);
}

export{hash}