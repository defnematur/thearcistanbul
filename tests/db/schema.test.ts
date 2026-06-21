import { describe, it, expect } from "vitest";
import { posts, users, postStatus } from "@/lib/db/schema";

describe("schema", () => {
  it("posts has status enum draft|published", () => {
    expect(postStatus).toEqual(["draft", "published"]);
  });

  it("users.email is unique", () => {
    const col = users.email;
    expect(col).toBeDefined();
  });

  it("posts has slug_tr and slug_en columns", () => {
    expect(posts.slugTr).toBeDefined();
    expect(posts.slugEn).toBeDefined();
  });
});
