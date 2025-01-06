/** @format */

// import Header from "../../components/header/Header";
// import NavigationSticky from "../../components/navigationSticky/NavigationSticky";
// import StickyFooter from "../../components/stickyFooter/StickyFooter";
// import BottomFooter from "../../components/bottomFooter/BottomFooter";
// import ScrollProgressBar from "../../components/scrollProgressBar/ScrollProgressBar";
// import Hero from "./sections/Hero";
// import About from "./sections/About";
// import Skills from "./sections/Skills";
// import Portfolio from "./sections/Portfolio";
// import Contact from "./sections/Contact";
// import { getDictionary } from "./dictionaries";

// export default async function Home({ params }: { params: { lang: string } }) {
// 	const dictionary = await getDictionary(params.lang as "en" | "fr");

// 	return (
// 		<>
// 			<Header dictionary={dictionary} />
// 			<NavigationSticky />
// 			<ScrollProgressBar />
// 			<Hero params={params} />
// 			<About params={params} />
// 			<Skills params={params} />
// 			<Portfolio params={params} />
// 			<Contact params={params} />
// 			<StickyFooter />
// 			<BottomFooter />
// 		</>
// 	);
// }

import ScrollProgressBar from "../../components/scrollProgressBar/ScrollProgressBar";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Skills from "./sections/Skills";
import Portfolio from "./sections/Portfolio";
import Contact from "./sections/Contact";
import Header from "../../components/header/Header";
import NavigationSticky from "../../components/navigationSticky/NavigationSticky";
import StickyFooter from "../../components/stickyFooter/StickyFooter";
import BottomFooter from "../../components/bottomFooter/BottomFooter";
import { getDictionary } from "./dictionaries";

export default async function Home(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	{ params }: any
) {
	// Récupère lang depuis params
	const { lang } = await params;

	// Cast en "en" | "fr"
	const dictionary = await getDictionary(lang as "en" | "fr");

	return (
		<>
			<Header dictionary={dictionary} />
			<NavigationSticky />
			<ScrollProgressBar />
			<Hero params={params} />
			<About params={params} />
			<Skills params={params} />
			<Portfolio params={params} />
			<Contact params={params} />
			<StickyFooter />
			<BottomFooter />
		</>
	);
}
