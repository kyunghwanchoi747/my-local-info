"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function AdBanner() {
  const adId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!adId || adId === "나중에_입력") {
    return null;
  }

  if (!isClient) return null;

  return (
    <div className="w-full flex justify-center my-12 overflow-hidden mx-auto max-w-3xl">
      <ins className="adsbygoogle"
           style={{ display: "block", minWidth: "300px", width: "100%", height: "90px" }}
           data-ad-client={adId}
           data-ad-slot="auto"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      <Script id="adsense-init" strategy="afterInteractive">
        {`(window.adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  );
}
