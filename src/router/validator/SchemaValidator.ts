import * as Ajv from "ajv";
import Pagination from "../utils/Pagination";
import PaginationQuery from "../utils/PaginationQuery";
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

export function parsePaginationQuery(paginationQuery: PaginationQuery, allowedSortByValues: string[]): Pagination {
    if (isNaN(paginationQuery.pageSize) || paginationQuery.pageSize < 1) {
        paginationQuery.pageSize = 10;
    }
    if (isNaN(paginationQuery.pageNumber) || paginationQuery.pageNumber < 1) {
        paginationQuery.pageNumber = 1;
    }
    if (!paginationQuery.sortDirection || paginationQuery.sortDirection != 'ASC' && paginationQuery.sortDirection != 'DESC') {
        paginationQuery.sortDirection = 'ASC';
    }
    if (!paginationQuery.sortBy || !allowedSortByValues.includes(paginationQuery.sortBy)) {
        paginationQuery.sortBy = 'id';
    }

    return new Pagination(+paginationQuery.pageSize, +paginationQuery.pageNumber, paginationQuery.sortBy, paginationQuery.sortDirection);
}
