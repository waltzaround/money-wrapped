import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/csv", "routes/csv.tsx"),
  route("/account", "routes/account.tsx"),
  route("/results", "routes/results.tsx"),
  route("/final-results", "routes/final-results.tsx"),
  // You can add more routes here as needed
] satisfies RouteConfig;
