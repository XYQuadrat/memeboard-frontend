export const shortcut = (
	node: HTMLButtonElement,
	params: {
		code: string;
		alt?: boolean;
		shift?: boolean;
		control?: boolean;
		callback?: () => unknown;
	}
) => {
	let handler: (ev: KeyboardEvent) => void;
	const removeHandler = () => removeEventListener('keydown', handler);
	const setHandler = () => {
		removeHandler();
		if (!params) return;
		handler = (e) => {
			if (
				!!params.alt != e.altKey ||
				!!params.shift != e.shiftKey ||
				!!params.control != (e.ctrlKey || e.metaKey) ||
				params.code != e.code
			)
				return;
			e.preventDefault();
			params.callback ? params.callback() : node.click();
		};
		window.addEventListener('keydown', handler);
	};
	setHandler();
	return {
		update: setHandler,
		destroy: removeHandler
	};
};
