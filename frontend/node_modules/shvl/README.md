# shvl

Get and set dot-notated properties within an object in only __157b__.

[![NPM version](https://img.shields.io/npm/v/shvl.svg)](https://www.npmjs.com/package/shvl)
[![Build Status](https://travis-ci.org/robinvdvleuten/shvl.svg?branch=master)](https://travis-ci.org/robinvdvleuten/shvl)

## Installation

```
$ npm i shvl --save

or

$ yarn add shvl
```

## Usage

```js
import shvl from 'shvl';

let obj = {
	a: {
		b: {
			c: 1
			d: undefined
			e: null
		}
	}
};

// Use dot notation for keys
shvl.set(obj, 'a.b.c', 2);
shvl.get(obj, 'a.b.c') === 2;

// Or use an array as key
shvl.get(obj, ['a', 'b', 'c']) === 1;

// Returns undefined if the path does not exist and no default is specified
shvl.get(obj, 'a.b.c.f') === undefined;
```
