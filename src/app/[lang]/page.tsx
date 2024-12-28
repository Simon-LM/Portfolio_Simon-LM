/** @format */

// Comment in English: Dynamic page: /fr or /en
import Header from "../../components/header/Header";

export default function Home({ params }: { params: { lang: string } }) {
	return (
		<>
			<Header />
			<main>
				<h2>
					{params.lang === "en"
						? "Welcome to my site"
						: "Bienvenue sur mon site"}
				</h2>
			</main>
		</>
	);
}
