/** @format */

// import Image from "next/image";
// import { useState, useEffect, useRef } from "react";
// import { useLanguageStore } from "../../store/langueStore";

// const translations = {
// 	fr: {
// 		cookieMessage: "Cette vidéo inclut des cookies tiers de YouTube.",
// 		acceptButton: "Accepter et voir la vidéo",
// 		thumbnailAlt: "Aperçu de la vidéo sur l'accessibilité web",
// 		closeButton: "Fermer la vidéo",
// 	},
// 	en: {
// 		cookieMessage: "This video includes third-party cookies from YouTube.",
// 		acceptButton: "Accept and watch video",
// 		thumbnailAlt: "Web accessibility video preview",
// 		closeButton: "Close video",
// 	},
// };

// export default function VideoPlayer({ videoTitle }: { videoTitle: string }) {
// 	const [cookiesAccepted, setCookiesAccepted] = useState(false);
// 	const { language } = useLanguageStore();
// 	const t = translations[language as keyof typeof translations];
// 	const videoRef = useRef<HTMLIFrameElement>(null);
// 	const closeButtonRef = useRef<HTMLButtonElement>(null);

// 	useEffect(() => {
// 		const handleKeyDown = (event: KeyboardEvent) => {
// 			if (event.key === "Escape" && cookiesAccepted) {
// 				setCookiesAccepted(false);
// 				closeButtonRef.current?.focus();
// 			}
// 		};

// 		document.addEventListener("keydown", handleKeyDown);

// 		return () => {
// 			document.removeEventListener("keydown", handleKeyDown);
// 		};
// 	}, [cookiesAccepted]);

// 	if (!cookiesAccepted) {
// 		return (
// 			<div className="about__video-placeholder">
// 				<Image
// 					src="/Why_img-video/img_video_youtube.png"
// 					alt={t.thumbnailAlt}
// 					fill
// 					className="about__video-thumbnail"
// 					priority={false}
// 					sizes="(max-width: 768px) 100vw, 800px"
// 				/>

// 				<div className="about__video-overlay">
// 					<div className="about__video-overlay-content">
// 						<p>{t.cookieMessage}</p>
// 						<button
// 							onClick={() => setCookiesAccepted(true)}
// 							className="about__video-button"
// 							aria-label={t.acceptButton}>
// 							{t.acceptButton}
// 						</button>
// 					</div>
// 				</div>
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className="about__video-container">
// 			<iframe
// 				className="about__video-frame"
// 				src="https://www.youtube-nocookie.com/embed/GeMASrgF1Hg?si=mkehlWufiSG_j0tu"
// 				title={videoTitle}
// 				loading="lazy"
// 				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
// 				referrerPolicy="strict-origin-when-cross-origin"
// 				allowFullScreen
// 				ref={videoRef}
// 			/>
// 			<button
// 				className="about__video-close-button"
// 				onClick={() => setCookiesAccepted(false)}
// 				ref={closeButtonRef}
// 				aria-label={t.closeButton}>
// 				{t.closeButton}
// 			</button>
// 		</div>
// 	);
// }

// // // // // // // // // // // // //

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useLanguageStore } from "../../store/langueStore";

const translations = {
	fr: {
		cookieMessage: "Cette vidéo inclut des cookies tiers de YouTube.",
		acceptButton: "Accepter et voir la vidéo",
		thumbnailAlt: "Aperçu de la vidéo sur l'accessibilité web",
		closeButton: "Fermer la vidéo",
	},
	en: {
		cookieMessage: "This video includes third-party cookies from YouTube.",
		acceptButton: "Accept and watch video",
		thumbnailAlt: "Web accessibility video preview",
		closeButton: "Close video",
	},
};

export default function VideoPlayer({ videoTitle }: { videoTitle: string }) {
	const [cookiesAccepted, setCookiesAccepted] = useState(false);
	const { language } = useLanguageStore();
	const t = translations[language as keyof typeof translations];
	const videoRef = useRef<HTMLIFrameElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && cookiesAccepted) {
				setCookiesAccepted(false);
				closeButtonRef.current?.focus();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [cookiesAccepted]);

	if (!cookiesAccepted) {
		return (
			<div className="about__video-wrapper">
				<div className="about__video-placeholder">
					<Image
						src="/Why_img-video/img_video_youtube.png"
						alt={t.thumbnailAlt}
						fill
						className="about__video-thumbnail"
						priority={false}
						sizes="(max-width: 768px) 100vw, 800px"
					/>
				</div>
				<div className="about__video-consent-overlay">
					<div className="about__video-consent-content">
						<p>{t.cookieMessage}</p>
						<button
							onClick={() => setCookiesAccepted(true)}
							className="about__video-button"
							aria-label={t.acceptButton}>
							{t.acceptButton}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="about__video-container">
			<iframe
				className="about__video-frame"
				src="https://www.youtube-nocookie.com/embed/GeMASrgF1Hg?si=mkehlWufiSG_j0tu"
				title={videoTitle}
				loading="lazy"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				referrerPolicy="strict-origin-when-cross-origin"
				allowFullScreen
				ref={videoRef}
			/>
			<button
				className="about__video-close-button"
				onClick={() => setCookiesAccepted(false)}
				ref={closeButtonRef}
				aria-label={t.closeButton}>
				{t.closeButton}
			</button>
		</div>
	);
}
