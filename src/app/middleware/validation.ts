import Ajv from "ajv";
import randToken from 'rand-token';
const ajv = new Ajv({removeAdditional:'all',strict:false});

const validate = async (schemas:object,data:any)=>{
    try{
        const validator = ajv.compile(schemas);
        const valid = await validator(data);
        if (!valid){
            return ajv.errorsText(validator.errors);
        }
        return true;
    }catch(err){
        return err.message;
    }
}

function validateSqlDatetime(dateTimeString:string) {
    const sqlDatetimeRegex = /\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d{3}/;
    return sqlDatetimeRegex.test(dateTimeString);
}

const validateEmail = async(email:string): Promise<any> => {
    const emailRegex = /(([a-z]|[0-9])+(([.])([a-z]|[0-9])+)*([@])([a-z]|[0-9])+(([.])([a-z]|[0-9])+)+)/;
    if (email.match(emailRegex)) {
        return true;
    } else {
        return false;
    }
}


const randomToken = async (x: number) : Promise<any> =>{
    return randToken.generate(x);
};
export{validate,validateEmail,randomToken,validateSqlDatetime}