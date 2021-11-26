import { Readability } from '@mozilla/readability';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import util from 'util';
import sanitize from 'sanitize-filename';
const writeFileAsync = util.promisify(fs.writeFile);
const sleep = (ms) => { return new Promise(resolve => setTimeout(resolve, ms)); }

import * as req from './request.js';


/**
 * Execute and save one url, including the index
 * @param {*} url 
 * @param {*} index 
 */
const single = async (url,index = null) =>{
	var response  = await fetch(url)
	const body = await response.text();
	
	var doc = new JSDOM(body, {
		url: url
	});
	
	let reader = new Readability(doc.window.document);
	let article = reader.parse();
	
	//extract from article
	let {title,content} = article;

	//ensure good title
	title = ((title ||'') === '' || title === url) ? url.split('/').slice(-1)[0]: title;
	//add metadata on top
	content = `<h1>${title}</h1><h5>Original: <a target="_blank" href="${url}">${url}</a></h5>${content}`;
	
	console.log('title',title)
	
	//save
	let prefix = index === null ? ``: `${index} - `;
	const path = `./out/${prefix}${sanitize(title)}.html`;
	await writeFileAsync(path,content);
	console.log(`SUCCESS for ${url}`);
};

/**
 * Batch Service
 * @param {*} urls 
 * @param {*} max_delay 
 */
 const batch = async (req) =>{
	
	//parse options
	const {urls,max_delay,index_in_title} = req;

	for(const [index,url] of urls.entries()){
		try{
			single(url,index_in_title ? index: null)
			await sleep(max_delay*Math.random());
		}
		catch(ex){
			console.error(`ERROR for ${url}: ${JSON.stringify(ex)}\n`)
		}
	}
};



/**
 * START HERE
 */
batch(req);