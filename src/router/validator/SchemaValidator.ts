import * as Ajv from "ajv";
const ajv = new Ajv();

export function validate(schema: any, data: any) {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
        return validate.errors;
    }
}
