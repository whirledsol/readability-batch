import { Readability } from '@mozilla/readability';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import util from 'util';
import sanitize from 'sanitize-filename';

const writeFileAsync = util.promisify(fs.writeFile);

import urls from './data.js';

const batch = (urls) =>{
	for(const url of urls){
		try{
			process(url)
		}
		catch(ex){
			console.error(`ERROR for ${url}: ${JSON.stringify(ex)}\n`)
		}
	}
};

const process = async (url) =>{
	var response  = await fetch(url)
	const body = await response.text();
	
	var doc = new JSDOM(body, {
		url: url
	});
	
	let reader = new Readability(doc.window.document);
	let article = reader.parse();
	const {title,content} = article;

	const path = `./out/${sanitize(title)}.html`;
	await writeFileAsync(path,content);
};

batch(urls);