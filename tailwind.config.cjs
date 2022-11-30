const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter V', ...defaultTheme.fontFamily.sans]
			}
		}
	},
	plugins: [require("@tailwindcss/forms")]
};
