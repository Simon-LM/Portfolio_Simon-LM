/** @format */

import Header from "../../components/header/Header";
import StickyFooter from "../../components/stickyFooter/StickyFooter";
import BottomFooter from "../../components/bottomFooter/BottomFooter";
import ScrollProgressBar from "../../components/scrollProgressBar/ScrollProgressBar";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Skills from "./sections/Skills";

export default function Home({ params }: { params: { lang: string } }) {
	return (
		<>
			<Header />
			<ScrollProgressBar />
			<Hero params={params} />
			<About params={params} />
			<Skills params={params} />
			<StickyFooter />
			<BottomFooter />
		</>
	);
}
