import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { DataRepository } from "../repositories/dataRepository";
import { generateToken, authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { authRateLimiter } from "../middleware/rateLimit";
import { validateBody } from "../middleware/validate";
import { RegisterSchema, LoginSchema, ProfileUpdateSchema } from "../validators/schemas";

const router = Router();

// Register
router.post("/register", authRateLimiter, validateBody(RegisterSchema), async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;
  const existing = await DataRepository.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({
      success: false,
      detail: "An account with this email already exists",
      error: { code: "EMAIL_ALREADY_EXISTS", message: "An account with this email already exists" },
    });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await DataRepository.createUser({
    id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    email,
    phone: phone || "",
    passwordHash,
    createdAt: new Date().toISOString(),
  });

  const token = generateToken(newUser.id);
  res.status(201).json({
    success: true,
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone },
  });
});

// Login
router.post("/login", authRateLimiter, validateBody(LoginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await DataRepository.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({
      success: false,
      detail: "Invalid email or password",
      error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
    });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return res.status(401).json({
      success: false,
      detail: "Invalid email or password",
      error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
    });
  }

  const token = generateToken(user.id);
  res.json({
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
  });
});

// Demo Login (development / preview quick access)
router.post("/demo-login", authRateLimiter, async (req: Request, res: Response) => {
  let demo = await DataRepository.findUserByEmail("kiran@exploro.in");
  if (!demo) {
    demo = await DataRepository.createUser({
      id: "user-demo-1",
      name: "Kiran Explorer",
      email: "kiran@exploro.in",
      phone: "+91 98765 43210",
      passwordHash: await bcrypt.hash("exploro123", 10),
      createdAt: new Date().toISOString(),
    });
  }

  const token = generateToken(demo.id);
  res.json({
    success: true,
    token,
    user: { id: demo.id, name: demo.name, email: demo.email, phone: demo.phone },
  });
});

// Current User Profile
router.get("/me", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  res.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
  });
});

// Update Profile
router.patch("/me", authenticateToken, validateBody(ProfileUpdateSchema), async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const updated = await DataRepository.updateUserProfile(user.id, req.body);
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { code: "USER_NOT_FOUND", message: "User not found" },
    });
  }
  res.json({
    success: true,
    user: { id: updated.id, name: updated.name, email: updated.email, phone: updated.phone },
  });
});

export default router;
