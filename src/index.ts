import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { config } from "dotenv";
import { csrf } from "hono/csrf";
import { cors } from "hono/cors";
import product from "./routers/products";
import workspace from "./routers/workspaces";
import { Session, User } from "lucia";
import { authMiddleware } from "./middlewares/authMiddleware";

type Variables = {
  user: User | null;
  session: Session | null;
};

config();
const app = new Hono<{ Variables: Variables }>();

app.use(csrf());
app.use(cors({origin: ["http://localhost:5173"], credentials: true}));
app.route("api/v1/workspaces", workspace);
app.use("*", authMiddleware)
app.route("api/v1/products", product);




app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const port = Number(process.env.PORT);
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
