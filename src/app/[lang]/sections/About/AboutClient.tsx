/** @format */
// "use client";
"use client";

import dynamic from "next/dynamic";

const VideoPlayer = dynamic(
	() => import("../../../../components/videoPlayer/VideoPlayer"),
	{
		loading: () => (
			<div className="about__video-placeholder">Chargement...</div>
		),
		ssr: false,
	}
);

interface AboutDictionary {
	title: string;
	subtitle: string;
	videoTitle: string;
}

interface AboutProps {
	dictionary: AboutDictionary;
}

export default function AboutClient({ dictionary }: AboutProps) {
	return (
		<section id="about" className="about">
			<div className="about__container">
				<h2 className="about__title">{dictionary.title}</h2>
				<p className="about__subtitle">{dictionary.subtitle}</p>
				<div className="about__video">
					<VideoPlayer videoTitle={dictionary.videoTitle} />
				</div>
			</div>
		</section>
	);
}
