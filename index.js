import { Readability } from '@mozilla/readability';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import util from 'util';
import sanitize from 'sanitize-filename';

const writeFileAsync = util.promisify(fs.writeFile);
const sleep = (ms) => { return new Promise(resolve => setTimeout(resolve, ms)); }

import urls from './data.js';
const MAX_DELAY = 10.0;

const batch = async (urls) =>{
	for(const [index,url] of urls.entries()){
		try{
			process(url,index)
			await sleep(MAX_DELAY*Math.random())
		}
		catch(ex){
			console.error(`ERROR for ${url}: ${JSON.stringify(ex)}\n`)
		}
	}
};

const process = async (url,index) =>{
	var response  = await fetch(url)
	const body = await response.text();
	
	var doc = new JSDOM(body, {
		url: url
	});
	
	let reader = new Readability(doc.window.document);
	let article = reader.parse();
	const {title,content} = article;

	const path = `./out/${index} - ${sanitize(title)}.html`;
	await writeFileAsync(path,content);
};

batch(urls);