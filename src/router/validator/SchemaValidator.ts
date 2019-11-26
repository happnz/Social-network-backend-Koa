import * as Ajv from "ajv";
const ajv = new Ajv({allErrors: true});

export function validateSchema(schema: any, data: any) {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
        return validate.errors;
    }
}

export function validationMiddleware(schema) {
    return async (ctx, next) => {
        const errors = validateSchema(schema, ctx.request.body);
        if (Array.isArray(errors) && errors.length > 0) {
            ctx.status = 400;
            ctx.body = errors.map(error => ({
                field: error.dataPath.substring(1),
                message: error.message
            }));
        } else {
            await next();
        }
    }
}
