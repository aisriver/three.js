import terser from '@rollup/plugin-terser';
import MagicString from 'magic-string';

export function glsl() {

	return {

		transform( code, id ) {

			if ( /\.glsl.js$/.test( id ) === false ) return;

			code = new MagicString( code );

			code.replace( /\/\* glsl \*\/\`(.*?)\`/sg, function ( match, p1 ) {

				return JSON.stringify(
					p1
						.trim()
						.replace( /\r/g, '' )
						.replace( /[ \t]*\/\/.*\n/g, '' ) // remove //
						.replace( /[ \t]*\/\*[\s\S]*?\*\//g, '' ) // remove /* */
						.replace( /\n{2,}/g, '\n' ) // # \n+ to \n
				);

			} );

			return {
				code: code.toString(),
				map: code.generateMap()
			};

		}

	};

}

function header() {

	return {

		renderChunk( code ) {

			code = new MagicString( code );

			code.prepend( `/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */\n` );

			return {
				code: code.toString(),
				map: code.generateMap()
			};

		}

	};

}

/**
 * @type {Array<import('rollup').RollupOptions>}
 */
const builds = [
	// 新增 umd 打包
	{
		input: {
			'three.min.js': 'src/Three.js',
		},
		plugins: [
			glsl(),
			header(),
			terser()
		],
		preserveEntrySignatures: 'allow-extension',
		output: [
			{
				format: 'umd',
				dir: 'umd',
				minifyInternalExports: false,
				entryFileNames: '[name]',
				name: 'THREE',
  				inlineDynamicImports: true,
			}
		]
	},
	{
		input: {
			'three.webgpu.umd.min.js': 'src/Three.WebGPU.js',
		},
		plugins: [
			glsl(),
			header(),
			terser()
		],
		preserveEntrySignatures: 'allow-extension',
		output: [
			{
				format: 'umd',
				dir: 'umd',
				minifyInternalExports: false,
				entryFileNames: '[name]',
				name: 'THREE',
  				inlineDynamicImports: true,
			}
		]
	},
	{
		input: {
			'three.tsl.umd.min.js': 'src/Three.TSL.js'
		},
		plugins: [
			header(),
			terser()
		],
		preserveEntrySignatures: 'allow-extension',
		output: [
			{
				format: 'umd',
				dir: 'umd',
				minifyInternalExports: false,
				entryFileNames: '[name]',
				name: 'THREE_GPU_TSL',
  				inlineDynamicImports: true,
			}
		],
		// external: [ 'three/webgpu' ]
	},
];

export default ( args ) => args.configOnlyModule ? builds.slice( 0, 4 ) : builds;
