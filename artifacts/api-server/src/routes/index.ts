import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import shopsRouter from "./shops";
import healthcareRouter from "./healthcare";
import adminRouter from "./admin";
import setupRouter from "./setup";
import productsRouter from "./products";
import ordersRouter from "./orders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(shopsRouter);
router.use(healthcareRouter);
router.use(adminRouter);
router.use(setupRouter);
router.use(productsRouter);
router.use(ordersRouter);

export default router;
