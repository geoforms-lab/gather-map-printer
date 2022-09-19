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
		exit:true,
		hideControls:true,
		fullscreen:false,
		headless:true,
		mapType:'roadmap', //terrain, roadmap, hybrid, satellite
		timeout:30
	};

	if (process.argv[2][0] == '{') {
		opt = _append(opt, JSON.parse(process.argv[2]));
	}


	if (process.argv[2].indexOf('http') == 0) {
		opt.url = process.argv[2];
	}

	console.log(opt);

	if (process.argv.length > 3&&process.argv[3][0] == '{') {
		let arg3=JSON.parse(process.argv[3]);
		opt = _append(opt, arg3);
	}

	const browser = await puppeteer.launch({
		headless:opt.headless,
		devtools: opt.devtools
	});


	console.log(opt.url);


	const page = await browser.newPage();
	await page.setCacheEnabled(false);
	await page.setViewport({
		width: opt.w,
		height: opt.h,
		deviceScaleFactor: 1,
	});


	page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));


	await page.goto(opt.url, {
		waitUntil: 'networkidle2'
	});

	await page.waitForTimeout(500);

	await page.waitForTimeout(500);

	const btn = await page.$('li.menu-project-map');
	
	await btn.evaluate(btn => btn.click());

	await page.waitForTimeout(1000);

	if(opt.fullscreen){
		await page.evaluate(() => {
			GeoliveMapInstances[0].getFullscreenHandler().toggle();
		});
	}


	await page.evaluate((type) => {
			GeoliveMapInstances[0].getBaseMap().setMapTypeId(type);
	}, opt.mapType);


	if(opt.hideControls){
		await page.evaluate(() => {
			UIMapControl.AllControls().forEach(function(c) {
				  c.remove();
			});

			var gm=GeoliveMapInstances[0];
			gm.getBaseMap().setOptions({
				zoomControl:false,
				mapTypeControl:false
			})

		});
	}


	


	const mapArea = await page.$('.map-content');
	const box = await mapArea.boundingBox(); // this method returns an array of geometric parameters of the element in pixels.


	await page.exposeFunction('onMapReadyEvent', async () => {
	    
	    await page.waitForTimeout(2000);

	    await page.screenshot({
			'path': opt.out,
			'clip':box,
			'omitBackground':true
		});

		

		console.log('Took Screenshot');

		if(opt.exit){
			await browser.close();
		}
	});


	/*await*/ page.evaluate(() => {
	    var gm=GeoliveMapInstances[0];

	    gm.runOnceOnIdle(function() {
             window.onMapReadyEvent();
        });
	});

	console.log('Add timeout: '+opt.timeout);
	setTimeout(async ()=>{

		await page.screenshot({
			'path': opt.out,
			'clip':box,
			'omitBackground':true
		});

		console.log('Took Screenshot (timeout)');

		if(opt.exit){
			await browser.close();
		}

	}, opt.timeout*1000);

	

})();