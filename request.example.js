import {WIKIPEDIA} from 'optimizations';

//Delay between requests (in ms)
export const max_delay = 10 * 1000;

//prepend the exported html file title with the index
export const index_in_title = false;

//if set to true, returns an mp3 file instead of the text content using gTTS
export const tts = false;

//regex replacement
//export const optimize_content = WIKIPEDIA;

//list of urls to parse
export const urls = [
	'https://www.example.com/article/1234'
];