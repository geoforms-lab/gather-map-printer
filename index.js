const puppeteer = require('puppeteer');


const _append = (a, b) => {

	Object.keys(b).forEach((k) => {
		if(b.hasOwnProperty(k)){
			a[k] = b[k];
		}
	});
	return a;

};



(async () => {


	let opt = {
		w: 1920,
		h: 1080,
		out: 'map.png',
		devtools: false,
	};

	console.log(opt);

	if (process.argv[2][0] == '{') {
		opt = _append(opt, JSON.parse(process.argv[2]));
	}

	console.log(opt);

	if (process.argv[2].indexOf('http') == 0) {
		opt.url = process.argv[2];
	}

	console.log(opt);

	if (process.argv.length > 3&&process.argv[3][0] == '{') {
		console.log(process.argv[3]);
		let arg3=JSON.parse(process.argv[3]);
		console.log(arg3);
		opt = _append(opt, arg3);
	}

	console.log(opt);


	const browser = await puppeteer.launch({
		devtools: opt.devtools
	});
	const page = await browser.newPage();

	page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));


	//'https://rmt.geoforms.ca/proposal/13/fa2960ee93327d2623a7dba1a4396219'

	await page.goto(opt.url, {
		waitUntil: 'networkidle2'
	});


	await page.setViewport({
		width: opt.w,
		height: opt.h
	})


	const btn = await page.$('li.menu-project-map');
	await btn.evaluate(btn => btn.click());

	await page.waitForTimeout(10000);

	await page.evaluate(() => {
		GeoliveMapInstances[0].getFullscreenHandler().toggle();
	});

	await page.waitForTimeout(2000);

	await page.screenshot({
		'path': opt.out,
	});

	await browser.close();

})();