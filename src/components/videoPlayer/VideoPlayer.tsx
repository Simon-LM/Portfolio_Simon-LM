/** @format */

import Image from "next/image";
import { useState } from "react";
import { useLanguageStore } from "../../store/langueStore";

const translations = {
	fr: {
		cookieMessage: "Cette vidéo inclut des cookies tiers de YouTube.",
		acceptButton: "Accepter et voir la vidéo",
		thumbnailAlt: "Aperçu de la vidéo sur l'accessibilité web",
	},
	en: {
		cookieMessage: "This video includes third-party cookies from YouTube.",
		acceptButton: "Accept and watch video",
		thumbnailAlt: "Web accessibility video preview",
	},
};

export default function VideoPlayer({ videoTitle }: { videoTitle: string }) {
	const [cookiesAccepted, setCookiesAccepted] = useState(false);
	const { language } = useLanguageStore();
	const t = translations[language as keyof typeof translations];

	if (!cookiesAccepted) {
		return (
			<div className="about__video-placeholder">
				<Image
					src="/Why_img-video/img_video_youtube.png"
					alt={t.thumbnailAlt}
					fill
					className="about__video-thumbnail"
					priority={false}
					sizes="(max-width: 768px) 100vw, 800px"
				/>
				<div className="about__video-overlay">
					<p>{t.cookieMessage}</p>
					<button
						onClick={() => setCookiesAccepted(true)}
						className="about__video-button">
						{t.acceptButton}
					</button>
				</div>
			</div>
		);
	}

	return (
		<iframe
			className="about__video-frame"
			src="https://www.youtube-nocookie.com/embed/GeMASrgF1Hg?si=mkehlWufiSG_j0tu"
			title={videoTitle}
			loading="lazy"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			referrerPolicy="strict-origin-when-cross-origin"
			allowFullScreen
		/>
	);
}
