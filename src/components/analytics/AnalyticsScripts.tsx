"use client";

import Script from "next/script";
import { AnalyticsSettings } from "@/app/actions/settings";

interface AnalyticsScriptsProps {
  settings: AnalyticsSettings;
}

/**
 * Component to inject analytics and tracking scripts
 * Supports: Google Analytics, Google Tag Manager, Meta Pixel, Microsoft Clarity
 */
export default function AnalyticsScripts({ settings }: AnalyticsScriptsProps) {
  const {
    google_analytics,
    google_tag_manager,
    meta_pixel,
    clarity,
  } = settings;

  return (
    <>
      {/* Google Analytics (GA4) */}
      {google_analytics && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${google_analytics}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${google_analytics}');
            `}
          </Script>
        </>
      )}

      {/* Google Tag Manager */}
      {google_tag_manager && (
        <>
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${google_tag_manager}');
            `}
          </Script>
          {/* GTM noscript fallback */}
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${google_tag_manager}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}

      {/* Meta Pixel (Facebook) */}
      {meta_pixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${meta_pixel}');
            fbq('track', 'PageView');
          `}
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${meta_pixel}&ev=PageView&noscript=1`}
            />
          </noscript>
        </Script>
      )}

      {/* Microsoft Clarity */}
      {clarity && (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarity}");
          `}
        </Script>
      )}
    </>
  );
}
