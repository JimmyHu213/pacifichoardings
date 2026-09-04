"use client";

import { useEffect, useRef, type RefObject } from "react";

// React resets an uncontrolled form's fields once its action settles, and our
// fields take their defaults from the server. On a rejected save that wipes
// everything the operator typed and leaves them with only an error message —
// on the longer forms that can be a page of lost work.
//
// This keeps a snapshot of what was submitted and puts it back whenever the
// action reports an error. File inputs are skipped: a browser won't let a
// file selection be restored programmatically, and the operator has to pick
// the file again anyway.
export function useRestoreOnError(state: { status: string }): RefObject<HTMLFormElement | null> {
	const formRef = useRef<HTMLFormElement>(null);
	const submitted = useRef<[string, string][]>([]);

	useEffect(() => {
		const form = formRef.current;
		if (!form) return;
		// Capture phase, so this runs before React's own submit handling.
		const capture = () => {
			submitted.current = Array.from(new FormData(form).entries()).filter(
				(entry): entry is [string, string] => typeof entry[1] === "string",
			);
		};
		form.addEventListener("submit", capture, true);
		return () => form.removeEventListener("submit", capture, true);
	}, []);

	// Depends on the whole state object: useActionState hands back a fresh one
	// per submission, so consecutive failures each restore their own values.
	useEffect(() => {
		if (state.status !== "error") return;
		const form = formRef.current;
		if (!form) return;

		for (const element of Array.from(form.elements)) {
			if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) continue;
			if (!element.name || element.disabled) continue;
			// Hidden fields are React-controlled and never typed by hand; file
			// inputs can't be restored programmatically at all.
			if (element instanceof HTMLInputElement && (element.type === "file" || element.type === "hidden")) continue;

			if (element instanceof HTMLInputElement && (element.type === "checkbox" || element.type === "radio")) {
				element.checked = submitted.current.some(([name, value]) => name === element.name && value === element.value);
				continue;
			}

			const match = submitted.current.find(([name]) => name === element.name);
			if (match) element.value = match[1];
		}
	}, [state]);

	return formRef;
}
