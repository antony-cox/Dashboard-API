const WorkoutModel = require('./workouts.model');
const puppeteer = require('puppeteer');
const { filter } = require('compression');

exports.get = async (req, res, next) => {
  const page = req.body.page > 0 ? parseInt(req.body.page) : 1;
  const limit = req.body.limit > 0 ? parseInt(req.body.limit) : 50;
  const category = req.body.category;
  const name = req.body.name;
  const skipIndex = (page - 1) * limit;
  let results;

  try {
    results = await WorkoutModel.get(category, name)
      .sort({name: 1})
      .limit(limit)
      .skip(skipIndex)
      .exec();

      res.status(201).send(results);
  } catch(e) {
    console.log(e);
    res.status(500).json({ message: "Error Occured" });
  }
}

exports.getDetail = async (req, res, next) => {
  const id = req.body.id;

  WorkoutModel.getDetail(id)
  .then((result) => {  
    res.status(201).send(result);
  })
  .catch((err) => {
      next(err);
  });
}

exports.scrape = async (req, res, next) => {
    getData();
    res.status(201).send();
}

async function getData()
{
  try
  {
    const browser = await puppeteer.launch({headless: false, args: ['--lang=en-GB,en']});
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto('https://www.trainerroad.com/app/cycling/workouts');

    await page.click('#Username');
    await page.keyboard.type('antony.cox@gmail.com');

    await page.click('#Password');
    await page.keyboard.type('Nt&a4a4Gp*6Z5AA*');

    await page.click('body > div.login > div.login__login > div.login__login-form > div > div.global-form > form > button');
    
    await page.waitForSelector('.training-item', {
        visible: true,
      }); 

    await page.setViewport({width: 1200, height: 800});

    log('Gathering workouts ...');

    const links = await scrapeInfiniteScrollItems(page, extractItems, 3209);

    log(links.length + ' workouts found.');

    let downloaded = 0;

    for(i = 0;i < links.length; i++)
    {
        await page.goto(links[i]);

        try {
          await page.waitForSelector('#workoutContainer > tr-chart', { visible: true, timeout: 60000 });  
        } catch(e) {
          await page.reload();
          await page.waitForSelector('#workoutContainer > tr-chart', { visible: true, timeout: 60000 });  
        }
          
        let rawData = await page.evaluate(function(){
            var data = Highcharts.charts[0].series[0].data;
            var filteredData = [];

            for(var y = 0; y<data.length;y++)
            {
              filteredData.push({time: data[y].x, power: data[y].y});
            }

            return filteredData;
        });

        let filteredData = [];
        let name = await getValue(page, '#workoutName');
        let description = await getValue(page, '#workoutContent > div.flexbox-col');
        let tss = await getValue(page, '#workoutOverviewStats > div:nth-child(2) > p.text--light.text.text--default.text--color__grey--6');
        let category = await getValue(page, '#main-content > tr-workout-details-container > tr-workout-details > div.flexbox-container.margin-top--40.padding-horizontal--16.sm__padding-horizontal--40.xl__padding-horizontal--none > tr-react-wrapper > div > div');

        rawData.forEach(d => {
          if(filteredData.filter(w => w.time == d.time).length == 0) { filteredData.push(d); }
        });

        let wData = [];
        let startTime = filteredData[0].time;
        let endTime = 0;
        let startPower = filteredData[0].power;
        let endPower = 0;

        for(let i = 0;i<filteredData.length;i++)
        {
          if(i == filteredData.length - 1)
          {
            endTime = filteredData[i].time;
            endPower = Math.round(filteredData[i].power);
            wData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
          } else if (filteredData[i].power + 1 < filteredData[i+1].power || filteredData[i].power - 1 > filteredData[i+1].power) {
            endTime = filteredData[i+1].time;
            endPower = Math.round(filteredData[i].power);
            wData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
            startTime = filteredData[i+1].time;
            startPower = Math.round(filteredData[i+1].power);
          }
        }

        let workout = {
          name: name,
          category: category != null ? category.replace(new RegExp('.[0-9]\.[0-9]'), '') : '',
          description: description,
          duration: wData[wData.length - 1].endTime,
          tss: Number(tss),
          data: wData,
          dateCreated: new Date()
        };

        WorkoutModel.getByName(workout.name)
        .then((result) => {
          if(result == null) {
            WorkoutModel.add(workout)
            .then((result) => {  
                log('Workout saved: ' + workout.name);
                downloaded++;
            })
            .catch((err) => {
                log(err);
            });
          } else {
            log('Workout skipped: ' + workout.name);
          }
        })
        .catch((err) => {
            next(err);
        })
    }

    log(downloaded + ' workouts downloaded.');
    await browser.close();
  } catch(e) {
    log(e);
  }
}

async function getValue(page, sel)
{
  return await page.evaluate((sel) => {
    let el = document.querySelector(sel);
    return el ? el.innerText: null;
  }, sel);
}

async function scrapeInfiniteScrollItems(page, extractItems, itemTargetCount, scrollDelay = 500,) {
  let items = [];
  try {
    let previousHeight;
    while (items.length < itemTargetCount) {
      items = await page.evaluate(extractItems);
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
      await page.waitForTimeout(scrollDelay);
    }
  } catch(e) { }
  return items;
}

function extractItems() {
  const extractedElements = document.querySelectorAll('.training-item');
  const items = [];
  for (let element of extractedElements) {
    items.push(element.href);
  }
  return items;
}

function log(msg)
{
  console.log(new Date() + ' - ' + msg);
}