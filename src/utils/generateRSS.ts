/** @format */

import { Feed } from "feed";

export async function generateRSS() {
	const feed = new Feed({
		title: "Simon LM - Blog",
		description:
			"Articles sur l'accessibilité web et le développement frontend",
		id: "https://simon-lm.dev/",
		link: "https://simon-lm.dev/",
		language: "fr",
		favicon: "https://simon-lm.dev/favicon.ico",
		copyright: `Tous droits réservés ${new Date().getFullYear()}, Simon LM`,
		author: {
			name: "Simon LM",
			link: "https://simon-lm.dev",
		},
	});

	// Ajouter vos articles ici
	feed.addItem({
		title: "Titre de l'article",
		id: "https://simon-lm.dev/blog/article-1",
		link: "https://simon-lm.dev/blog/article-1",
		description: "Description de l'article",
		content: "Contenu de l'article",
		date: new Date(),
		author: [
			{
				name: "Simon LM",
				link: "https://simon-lm.dev",
			},
		],
	});

	return feed.rss2();
}
