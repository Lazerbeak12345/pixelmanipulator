import love from 'eslint-config-love'
import tsdoc from 'eslint-plugin-tsdoc'
export default [
	{
		...love,
		name:"pixelmanipulator " + (love.name??""),
		files: ["src/**/*.ts","tests/**/*.ts"],
		plugins: {
			...love.plugins,
			tsdoc,
		},
		rules: {
			...love.rules,
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/explicit-module-boundary-types": "error",
			"tsdoc/syntax": "warn",
		}
	}
]
