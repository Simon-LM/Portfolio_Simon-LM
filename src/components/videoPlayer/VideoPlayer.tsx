/** @format */

export default function VideoPlayer({ videoTitle }: { videoTitle: string }) {
	return (
		<iframe
			className="about__video-frame"
			src="https://www.youtube.com/embed/GeMASrgF1Hg?si=mkehlWufiSG_j0tu"
			title={videoTitle}
			loading="lazy"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			referrerPolicy="strict-origin-when-cross-origin"
			allowFullScreen
		/>
	);
}
