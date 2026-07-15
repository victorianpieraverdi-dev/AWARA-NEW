// AWARA UI — GlassCard
// Строго реализует раздел "ФОРМУЛА СТЕКЛА" из AWARA_DESIGN_SYSTEM.md.
// Никаких плоских заливок, никаких нативных бордеров/теней по умолчанию.
//
// Props:
//   children   — содержимое карточки
//   className  — доп. классы
//   glow       — опц. свечение под карточкой (boolean | string).
//                true => бледно-золотое gold-glow; string => кастомный rgba/hex.
//   as         — опц. тег-обёртка (по умолчанию div)
//   style      — мердж пользовательских стилей

import React from "react";

const GOLD_GLOW = "rgba(212, 175, 55, 0.3)";

// Базовая формула стекла (единственный источник правды для панелей).
const GLASS_BASE = {
	background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
	backdropFilter: "blur(16px) saturate(120%)",
	WebkitBackdropFilter: "blur(16px) saturate(120%)",
	borderTop: "1px solid rgba(255,255,255,0.08)",
	borderLeft: "1px solid rgba(255,255,255,0.04)",
	borderRight: "none",
	borderBottom: "none",
	borderRadius: "18px",
	boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
	padding: "20px",
};

export default function GlassCard({
	children,
	className = "",
	glow = false,
	as: Tag = "div",
	style = {},
	...rest
}) {
	const glowColor =
		glow === true ? GOLD_GLOW : typeof glow === "string" ? glow : null;

	// Свечение — второй слой тени; базовая глубина сохраняется.
	const boxShadow = glowColor
		? `0 24px 48px rgba(0,0,0,0.4), 0 0 32px ${glowColor}`
		: GLASS_BASE.boxShadow;

	const mergedStyle = { ...GLASS_BASE, boxShadow, ...style };

	return (
		<Tag
			className={`awara-glass-card ${className}`.trim()}
			style={mergedStyle}
			{...rest}
		>
			{children}
		</Tag>
	);
}

export { GLASS_BASE };
