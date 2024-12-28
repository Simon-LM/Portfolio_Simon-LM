/** @format */

"use client";

import { useEffect, useState } from "react";
import { RiMenu3Line } from "react-icons/ri";

export default function NavigationSticky() {
	const [isHeaderVisible, setIsHeaderVisible] = useState(true);

	useEffect(() => {
		const handleScroll = () => {
			const headerHeight = document.querySelector("header")?.offsetHeight || 0;
			setIsHeaderVisible(window.scrollY < headerHeight);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div className={`navigation-sticky ${isHeaderVisible ? "with-text" : ""}`}>
			<button className="menu-button" aria-label="Menu principal">
				<RiMenu3Line />
				{isHeaderVisible && <span className="menu-text">Menu</span>}
			</button>
		</div>
	);
}
