export function sessionSetterMiddleware() { //TODO fix workaround
    return async (ctx, next) => {
        if (ctx.session && ctx.session.user) {
            ctx.state.user = ctx.session.user;
            ctx.session.user = null;
        }
        await next();
    }
}
