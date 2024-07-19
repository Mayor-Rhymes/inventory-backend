import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  insertWorkspaceSchema,
  selectWorkspaceSchema,
} from "../configs/db/schema/workspaces";
import { db } from "../configs/db";
import { lucia } from "../configs/utils/lucia";
import { hash, verify } from "@node-rs/argon2";
import { generateIdFromEntropySize, Session, User } from "lucia";
import { workspaces } from "../configs/db/schema/workspaces";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middlewares/authMiddleware";

type Variables = {
  user: User | null;
  session: Session | null;
};

const workspace = new Hono<{ Variables: Variables }>();

workspace.post(
  "/signup",
  zValidator("json", insertWorkspaceSchema),
  async (c) => {
    const workspace = c.req.valid("json");

    const passwordHash = await hash(workspace.password, {
      // recommended minimum parameters
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const workspaceId = await generateIdFromEntropySize(10);

    try {
      await db.insert(workspaces).values({
        id: workspaceId,
        password: passwordHash,
        email: workspace.email,
        workspacename: workspace.workspacename,
      });

      const session = await lucia.createSession(workspaceId, {});
      c.header(
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize(),
        { append: true }
      );
      return c.json({
        message: "Signup was successful.",
        workspace: {
          id: workspaceId,
          name: workspace.workspacename,
          session: session,
        },
      });
    } catch (err) {
      return c.json({ message: "Server error" }, 500);
    }
  }
);

workspace.post(
  "/login",
  zValidator("json", selectWorkspaceSchema),
  async (c) => {
    const workspace = c.req.valid("json");
    try {
      const existingWorkspace = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.email, workspace.email));

      if (existingWorkspace.length === 0)
        return c.json({ message: "Workspace not found" }, 404);

      const validPassword = await verify(
        existingWorkspace[0].password,
        workspace.password,
        {
          memoryCost: 19456,
          timeCost: 2,
          outputLen: 32,
          parallelism: 1,
        }
      );

      if (!validPassword)
        return c.json(
          {
            message: "Access to workspace denied because of incorrect password",
          },
          403
        );
      const session = await lucia.createSession(existingWorkspace[0].id, {});
      c.header(
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize(),
        { append: true }
      );
      return c.json({
        message: "Login was successful.",
        workspace: {
          id: existingWorkspace[0].id,
          name: existingWorkspace[0].workspacename,
          session: session,
        },
      });
    } catch (err) {
      return c.json({ message: "Server error" }, 500);
    }
  }
);

workspace.post("/logout", authMiddleware, async (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user && !session) return c.json({ message: "Access denied" }, 403);

  c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
    append: true,
  });
  c.set("user", null);
  c.set("session", null);

  return c.json({ message: "You have successfully logged out of workspace" });
});

export default workspace;
