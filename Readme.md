# Use TypeScript directly in browser

Useful for tiny TypeScript browser projects.

Inspired by:

- https://kofi.sexy/blog/modern-spas
- https://klesun.github.io/ts-browser/

## Overview

It's working. I tested it with fetchCat, a fetch wrapper
concatenating two files using the Stream API. fetchCat/index.html
is sort of an unit test to fetchCat().

index.html contains some code setting up the TypeScript compiler
(in tsc.js). This code is written in JavaScript because there was
some conflict with modules and I didn't get it working in TypeScript.
I symlinked typescript.js from node_modules, too.

In this html file add <script src=file.ts type=ts> and the TypeScript
files are transpiled and loaded without any need to bundle. With
alive-server you can reload as soon as you save. You also need a
dist directory, tsc --watch compiling to the dist directory. This
way you see TypeScript error immediately. Error handling in the
browser is not very nice, but with tsc --watch you don't need it.

Additionally you could symlink the generated .js files, but this is
not really neccessary. I did that in fetchcat so that my friend can
download the generated js files.

## Setup

- npm install installs what you need
- symlink typescript.js from node_modules
- start tsc --watch
- start alive-server
- Hack away

## Components

- TypeScript
- alive-server
- tsc.js
- HTML file with <script src=example.ts type=ts>

## Todo

- Do modules really work?

