/** @format */
// Ré-export du paquet (E4) : la source unique de la liste des thèmes vit
// désormais dans packages/a11y-prefs/react/themes.ts. Ce shim préserve les
// chemins d'import existants (@/config/themes) — zéro churn.
// Import granulaire (module de données pur, sans hook) : ce shim est
// consommé aussi par des Server Components (layout.tsx) — passer par le
// barrel ./react tirerait les hooks client dans le graphe serveur.
export { THEMES, type ThemeOption } from "a11y-prefs/react/themes";
