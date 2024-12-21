import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/csv", "routes/csv.tsx"),
  // You can add more routes here as needed
] satisfies RouteConfig;
