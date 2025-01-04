import type { Route } from "./+types/home";
import { Helmet } from "react-helmet";
import { Welcome } from "../welcome/welcome";
import { Header } from "~/components/header";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Money Wrapped - Track Your Financial Journey</title>
        <meta name="description" content="Money Wrapped helps you understand your spending patterns and financial habits. Get detailed insights about your transactions and spending behavior." />
        <meta property="og:title" content="Money Wrapped - Track Your Financial Journey" />
        <meta property="og:description" content="Money Wrapped helps you understand your spending patterns and financial habits. Get detailed insights about your transactions and spending behavior." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Money Wrapped - Track Your Financial Journey" />
        <meta name="twitter:description" content="Money Wrapped helps you understand your spending patterns and financial habits. Get detailed insights about your transactions and spending behavior." />
      </Helmet>
      <Header />
      <Welcome />
    </>
  );
}
