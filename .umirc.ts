import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", redirect: "/projects" },
    { path: "/projects", component: "projects" },
    { path: "/detail", component: "detail" },
  ],
  history: {
    type: "hash",
  },
  npmClient: "yarn",
});
