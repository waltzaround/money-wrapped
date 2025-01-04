import { Helmet } from "react-helmet";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function SEO({
  title = "Money Wrapped - Your Financial Year in Review",
  description = "Discover insights about your spending habits and financial patterns with Money Wrapped. Get a personalized year-end financial review.",
  image = "/og-image.jpg", // You'll need to add this image to your public folder
  url = "https://money.haxx.nz", 
}: SEOProps) {
  const pageTitle = title 
    ? `${title} | Money Wrapped`
    : "Money Wrapped - Your Financial Year in Review";

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <link rel="icon" type="image/png" href="/favicon.png" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="theme-color" content="#ffffff" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
