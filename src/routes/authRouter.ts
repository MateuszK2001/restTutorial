import { Router } from "express";
import { body } from "express-validator";
import { postLogin, putSignup } from "../controllers/authController";
import User from "../models/user";

const authRouter = Router();

authRouter.put('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter valid email.')
        .custom(async (value, { req }) => {
            const user = await User.findOne({ email: value });
            if (user)
                throw new Error("Email already exists");
            return true;
        })
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength({ min: 5 }),
    body('name')
        .trim()
        .not()
        .isEmpty()
], putSignup);

authRouter.post('/login', postLogin);

export default authRouter;