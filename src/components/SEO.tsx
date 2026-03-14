import Head from "next/head";
import { Fragment } from "react";

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const defaultSEO = {
  title: "Harding Homes - Professional Building & Construction Management",
  description: "Comprehensive job management system for building projects. Track jobs, manage teams, communicate with customers, and streamline your construction business.",
  image: "/og-image.png",
  url: "https://hardinghomesltd.com"
};

export function SEOElements({ 
  title = defaultSEO.title, 
  description = defaultSEO.description,
  image = defaultSEO.image,
  url = defaultSEO.url
}: SEOProps = {}) {
  return (
    <Fragment>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Fragment>
  );
}

export function SEO({ 
  title = defaultSEO.title, 
  description = defaultSEO.description,
  image = defaultSEO.image,
  url = defaultSEO.url
}: SEOProps = {}) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
  );
}
