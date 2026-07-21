"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FocusEvent, type MouseEvent } from "react";

export interface NavDropdownItem {
	href: string;
	label: string;
}

/* W3C APG "disclosure" pattern: a toggle button plus a plain list of links —
   not a full role="menu" widget. Tab/Shift+Tab moves through it like any
   other links; Enter/Space toggles the button (native <button> behaviour);
   Escape, clicking outside, or focus leaving the component all close it.
   `variant="popover"` is the desktop dropdown (absolute, hover-to-open on
   top of click); `variant="accordion"` is the same logic rendered inline for
   the mobile menu, with no hover handling since it doesn't apply on touch. */
export default function NavDropdown({
	label,
	items,
	triggerClassName,
	variant = "popover",
}: {
	label: string;
	items: NavDropdownItem[];
	triggerClassName?: string;
	variant?: "popover" | "accordion";
}) {
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const panelId = useId();

	useEffect(() => {
		if (!open) return;

		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false);
		}
		function onPointerDown(e: PointerEvent) {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
		}
		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("pointerdown", onPointerDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("pointerdown", onPointerDown);
		};
	}, [open]);

	function handleBlur(e: FocusEvent<HTMLDivElement>) {
		if (!rootRef.current?.contains(e.relatedTarget)) setOpen(false);
	}

	// A real pointer click on the popover trigger fires `mouseenter` (which
	// opens it via hover) a moment before the `click` itself — toggling here
	// would immediately flip it back closed. `event.detail === 0` reliably
	// identifies a keyboard-activated click (Enter/Space), which never fires
	// mouseenter, so it's safe to toggle there. Real pointer clicks just
	// re-affirm the open state; hover-leave/outside-click/Escape close it.
	function handleTriggerClick(e: MouseEvent<HTMLButtonElement>) {
		if (variant === "popover" && e.detail !== 0) {
			setOpen(true);
		} else {
			setOpen((v) => !v);
		}
	}

	const hoverProps =
		variant === "popover"
			? {
					onMouseEnter: () => {
						if (closeTimer.current) clearTimeout(closeTimer.current);
						setOpen(true);
					},
					onMouseLeave: () => {
						if (closeTimer.current) clearTimeout(closeTimer.current);
						closeTimer.current = setTimeout(() => setOpen(false), 150);
					},
				}
			: {};

	return (
		<div ref={rootRef} className="nav-dropdown" onBlur={handleBlur} {...hoverProps}>
			<button
				type="button"
				className={`nav-dropdown-trigger${triggerClassName ? ` ${triggerClassName}` : ""}`}
				aria-expanded={open}
				aria-controls={panelId}
				onClick={handleTriggerClick}
			>
				{label}
				<span className={`nav-dropdown-caret${open ? " is-open" : ""}`} aria-hidden="true">
					▾
				</span>
			</button>
			<ul id={panelId} hidden={!open} className={variant === "accordion" ? "nav-dropdown-accordion" : "nav-dropdown-panel"}>
				{items.map((item) => (
					<li key={item.href}>
						<Link href={item.href} onClick={() => setOpen(false)}>
							{item.label}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
