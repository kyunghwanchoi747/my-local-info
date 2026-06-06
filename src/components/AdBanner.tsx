"use client";

import { useEffect } from "react";

interface AdBannerProps {
  slot: string;
  format?: string;
  responsive?: string;
}

export default function AdBanner({ slot, format = "auto", responsive = "true" }: AdBannerProps) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const isAdsenseEnabled = adsenseId && adsenseId !== "나중에_입력" && adsenseId.trim() !== "";

  useEffect(() => {
    if (isAdsenseEnabled) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [isAdsenseEnabled]);

  if (!isAdsenseEnabled) {
    return null;
  }

  return (
    <div className="my-8 flex justify-center overflow-hidden w-full">
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", textAlign: "center" }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
