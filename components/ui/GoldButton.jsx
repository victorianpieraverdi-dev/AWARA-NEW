// AWARA UI — GoldButton
// Премиальный золотой перелив (без коричневых/болотных оттенков).
// Тёмный текст #1A1A1A для контраста + мощная золотая тень-свечение.
//
// Props:
//   children   — лейбл кнопки
//   className  — доп. классы
//   onClick    — обработчик
//   type       — button | submit (по умолчанию button)
//   disabled   — состояние
//   icon       — опц. монохромный stroke-SVG (узел React), без fill-заливок
//   style      — мердж пользовательских стилей

import React from "react";

// Чистый золотой перелив: светлый блик -> золото -> тёмная кромка.
const GOLD_GRADIENT = "linear-gradient(135deg, #FBE18D 0%, #D4AF37 55%, #8B6508 100%)";

const BASE = {
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	gap: "8px",
	background: GOLD_GRADIENT,
	color: "#1A1A1A",
	fontFamily: "'Cinzel', serif",
	fontWeight: 600,
	letterSpacing: "0.06em",
	fontSize: "0.95rem",
	padding: "12px 22px",
	border: "none",
	borderRadius: "14px",
	cursor: "pointer",
	boxShadow: "0 4px 20px rgba(212, 175, 55, 0.4)",
	transition: "transform .15s ease, box-shadow .25s ease, filter .2s ease",
};

const ICON_WRAP = { display: "inline-flex", alignItems: "center", lineHeight: 0 };

export default function GoldButton({
	children,
	className = "",
	onClick,
	type = "button",
	disabled = false,
	icon = null,
	style = {},
	...rest
}) {
	const [hover, setHover] = React.useState(false);

	const dynamic = disabled
		? { opacity: 0.5, cursor: "not-allowed", boxShadow: "none" }
		: hover
		? {
				transform: "translateY(-1px)",
				boxShadow: "0 6px 28px rgba(212, 175, 55, 0.55)",
				filter: "brightness(1.04)",
		  }
		: {};

	const mergedStyle = { ...BASE, ...dynamic, ...style };

	return (
		<button
			type={type}
			disabled={disabled}
			onClick={onClick}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			className={`awara-gold-button ${className}`.trim()}
			style={mergedStyle}
			{...rest}
		>
			{/* Иконка: только stroke-линии, currentColor наследует тёмный текст. */}
			{icon ? <span style={ICON_WRAP}>{icon}</span> : null}
			{children}
		</button>
	);
}

export { GOLD_GRADIENT };
