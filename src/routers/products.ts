import { Hono } from "hono";
import { Session, User } from "lucia";
import { db } from "../configs/db";
import { eq, sql, and } from "drizzle-orm";
import {
  products as dbProducts,
  patchProductSchema,
} from "../configs/db/schema/products";
import { zValidator } from "@hono/zod-validator";
import { createProductSchema } from "../configs/db/schema/products";

type Variables = {
  user: User | null;
  session: Session | null;
};

const product = new Hono<{ Variables: Variables }>();

product.get("/", async (c) => {
  const workspace = c.get("user");

  if (!workspace) return c.json({ message: "Access denied" }, 403);

  const workspaceId = workspace.id;

  try {
    const products = await db
      .select()
      .from(dbProducts)
      .where(eq(dbProducts.workspaceId, workspaceId));

    if (products.length === 0)
      return c.json({ message: "No products found" }, 404);

    return c.json({ message: "Products found", products });
  } catch (err) {
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

product.post("/", zValidator("json", createProductSchema), async (c) => {
  const productJson = c.req.valid("json");
  const workspace = c.get("user");

  if (!workspace) return c.json({ message: "Access denied" }, 403);

  const workspaceId = workspace.id;

  try {
    const createdProductIds = await db
      .insert(dbProducts)
      .values({ ...productJson, workspaceId: workspaceId })
      .$returningId();

    if (createdProductIds.length === 0)
      return c.json({ message: "Product creation failed" }, 409);

    const targetProductId = createdProductIds[0].id;

    const products = await db
      .select()
      .from(dbProducts)
      .where(
        sql`${dbProducts.id} = ${targetProductId} and ${dbProducts.workspaceId} = ${workspaceId}`
      );

    if (products.length === 0)
      return c.json({ message: "Product creation failed" }, 409);
    return c.json({
      message: "Product created successfully",
      product: products[0],
    });
  } catch (err) {
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

product.get("/:id", async (c) => {
  const id = c.req.param("id");
  const workspace = c.get("user");

  if (!workspace) return c.json({ message: "Access denied" }, 403);

  const workspaceId = workspace.id;

  try {
    const products = await db
      .select()
      .from(dbProducts)
      .where(
        sql`${dbProducts.workspaceId} = ${workspaceId} and ${dbProducts.id} = ${id}`
      );

    if (products.length === 0)
      return c.json({ message: "No products found" }, 404);

    return c.json({ message: "Product found", product: products[0] });
  } catch (err) {
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

product.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const workspace = c.get("user");

  if (!workspace) return c.json({ message: "Access denied" }, 403);

  const workspaceId = workspace.id;

  try {
    const products = await db
      .select()
      .from(dbProducts)
      .where(
        sql`${dbProducts.workspaceId} = ${workspaceId} and ${dbProducts.id} = ${id}`
      );

    if (products.length === 0)
      return c.json({ message: "No such product" }, 404);

    const productToDelete = products[0];
    if (!productToDelete) return c.json({ message: "No such product" }, 404);
    await db
      .delete(dbProducts)
      .where(
        sql`${dbProducts.workspaceId} = ${workspaceId} and ${dbProducts.id} = ${id}`
      );

    if (products.length === 0)
      return c.json({ message: "No products found" }, 404);

    return c.json({ message: "Product deleted successfully", productToDelete });
  } catch (err) {
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

product.patch("/:id", zValidator("json", patchProductSchema), async (c) => {
  const id = c.req.param("id");
  const patchedProduct = c.req.valid("json");
  const workspace = c.get("user");

  if (!workspace) return c.json({ message: "Access denied" }, 403);

  const workspaceId = workspace.id;

  try {
    const productExistsArr = await db
      .select()
      .from(dbProducts)
      .where(
        sql`${dbProducts.id} = id and ${dbProducts.workspaceId} = ${workspaceId}`
      );

    if (productExistsArr.length === 0)
      return c.json({ message: "Product not found" }, 404);

    await db
      .update(dbProducts)
      .set({ ...patchedProduct })
      .where(
        sql`${dbProducts.id} = id and ${dbProducts.workspaceId} = ${workspaceId}`
      );

    const updatedProductArr = await db
      .select()
      .from(dbProducts)
      .where(
        sql`${dbProducts.id} = id and ${dbProducts.workspaceId} = ${workspaceId}`
    );
    

    if (updatedProductArr.length === 0) return c.json({ message: "Product not found" }, 404);

    return c.json({ message: "Product updated successfully", product: updatedProductArr[0] }, 200);
  } catch (err) {
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

export default product;
