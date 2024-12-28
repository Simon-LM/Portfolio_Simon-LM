/** @format */

// Comment in English: Example sub-page for /fr/blog or /en/blog
import Header from "../../../components/header/Header";
import StickyFooter from "../../../components/stickyFooter/StickyFooter";
import BottomFooter from "../../../components/bottomFooter/BottomFooter";

export default function Blog({ params }: { params: { lang: string } }) {
	return (
		<>
			<Header />
			<main>
				<h2>
					{params.lang === "en"
						? "Blog LostInTab (English)"
						: "Blog LostInTab (Français)"}
				</h2>
			</main>
			<StickyFooter />
			<BottomFooter />
		</>
	);
}
