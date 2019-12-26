import * as Router from "koa-router";

const router = new Router();

router.get('/health', async (ctx) => {
    ctx.body = 'works!';
});

export default router;
