import { Readability } from '@mozilla/readability';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import util from 'util';
import sanitize from 'sanitize-filename';
import gTTS from 'gtts';
const writeFileAsync = util.promisify(fs.writeFile);
const sleep = (ms) => { return new Promise(resolve => setTimeout(resolve, ms)); }

import * as req from './request.js';

/**
 * Uses gTTS to convert to an audio file
 * @param {*} path 
 * @param {*} content 
 */
const convertToAudio = (path, content)=>{
	var gtts = new gTTS(content, 'en');
	return new Promise(resolve=>{
		gtts.save(path,cb=>{
			resolve();
		});
	});
}



/**
 * Execute and save one url, including the index
 * @param {*} url 
 * @param {*} index 
 */
const encodePage = async (req, url,index = null) =>{
	const {
		index_in_title = false,
		tts = false,
		optimize_tts = null,
		tts_slow= false
	} = req;
	console.log(`> STARTING ${url}`);
	var response  = await fetch(url)
	const body = await response.text();
	
	var doc = new JSDOM(body, {
		url: url
	});
	
	let reader = new Readability(doc.window.document);
	let article = reader.parse();
	
	//extract from article
	let {title,content,textContent} = article;

	//ensure good title
	title = ((title ||'') === '' || title === url) ? url.split('/').slice(-1)[0]: title;
	//add metadata on top
	content = `<h1>${title}</h1><h5>Original: <a target="_blank" href="${url}">${url}</a></h5>${content}`;
	
	console.log('\tParsed Content with Title',title)
	
	//save
	const prefix = index_in_title ? `${index} - ` : '';
	const pathWithoutExt = `./out/${prefix}${sanitize(title)}`;

	if(tts){
		textContent = textContent.replace(optimize_tts,'');

		//fix to pausing from Jakob Hoefflin https://stackoverflow.com/questions/40795103/text-to-speech-library-issue-with-pauses
		textContent = textContent.trim().replace(/\s\s+/g, ' '); 

		await convertToAudio(`${pathWithoutExt}.mp3`,textContent, tts_slow);
	}
	
	await writeFileAsync(`${pathWithoutExt}.html`,content);
	console.log(`> SUCCESS for ${url}`);
};

/**
 * Batch Service
 * @param {*} urls 
 * @param {*} max_delay 
 */
 const encodeBatch = async (req) =>{
	
	//parse options
	const {urls,max_delay,index_in_title,tts} = req;

	for(const [index,url] of urls.entries()){
		try{
			encodePage(req,url,index); //No wait so we can do this asyncronously
			await sleep(max_delay*Math.random()); //add a delay so it doesn't look like we are scraping. We are reading.
		}
		catch(ex){
			console.error(`ERROR for ${url}: ${JSON.stringify(ex)}\n`)
		}
	}
};



/**
 * START HERE
 */
 encodeBatch(req);