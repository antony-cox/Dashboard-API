const https = require('https');
const WorkoutModel = require('./workouts.model');
const puppeteer = require('puppeteer');
const { filter } = require('compression');

exports.get = async (req, res, next) => {
  const page = req.body.page != null ? parseInt(req.body.page) : 0;
  const limit = req.body.limit > 0 ? parseInt(req.body.limit) : 50;
  const category = req.body.category;
  const name = req.body.name;
  const tssLow = req.body.tssLow;
  const tssHigh = req.body.tssHigh;
  const skipIndex = page * limit;

  try {
    const count = await WorkoutModel.getCount(category, name, tssLow, tssHigh);
    const results = await WorkoutModel.get(category, name, tssLow, tssHigh)
      .sort({name: 1})
      .limit(limit)
      .skip(skipIndex)
      .exec();


    const data = {count: count, workouts: results};
    res.status(201).send(data);
  } catch(e) {
    console.log(e);
    res.status(500).json({ message: "Error Occured" });
  }
}

exports.getDetail = (req, res, next) => {
  const id = req.body.id;

  WorkoutModel.getDetail(id)
  .then((result) => {  
    res.status(201).send(result);
  })
  .catch((err) => {
      next(err);
  });
}

exports.sendToIntervals = (req, res, next) => {
  const workoutId = req.body.workoutId;
  const intervalsId = req.body.intervalsId;
  const intervalsKey = req.body.intervalsKey;
  const intervalsDate = req.body.intervalsDate;

  WorkoutModel.getDetail(workoutId)
  .then((result) => {  
    const mrcFile = createMrcFile(result);

    const data = JSON.stringify({
      category: 'WORKOUT',
      start_date_local: intervalsDate + 'T00:00:00',
      type: 'Ride',
      filename: result.name.replace(' ', '_').replace('+', '').replace('-', '') + '.mrc',
      file_contents: mrcFile
    });

    let basicAuth = 'Basic ' + Buffer.from('API_KEY' + ':' + intervalsKey).toString('base64');

    const options = {
      hostname: 'intervals.icu',
      path: '/api/v1/athlete/' + intervalsId + '/events',
      method: 'POST',
      headers: {
        Authorization: basicAuth,
        'Content-Type': 'application/json',
        'Content-Length': data.length  
      },
    }

    const request = https.request(options, response => {
      let chunks = [];

      response.on('data', d => {
        chunks.push(d);
      });

      response.on('end', result => {
        var body = Buffer.concat(chunks);
        res.status(201).send(body);
      });

      response.on('error', error => {
        res.status(500).send(error);
      });
    });

    request.write(data)
    request.end()
  })
  .catch((err) => {
      next(err);
  });
}

exports.getRaw = (req, res, next) => {
  const name = req.body.name;

  WorkoutModel.getRaw(name)
  .then((result) => {  
    let data = result.data;
    let filteredData = [];

    filteredData = data;

    let formattedData = [];
    let startTime = filteredData[0].time;
    let endTime = 0;
    let startPower = filteredData[0].power;
    let endPower = 0;
    let index = 0;
    let prevPower = 0;
    let power = 0;
    let nextPower = 0;

    while(index < filteredData.length)
    {
      //SET START VALUES
      startTime = filteredData[index].time;
      startPower = Math.round(filteredData[index].power);

      if(filteredData[index].time == filteredData[index+1].time)
      {
        index++;
      } else 
      if(index == filteredData.length - 1)
      {
        //LAST ELEMENT
        endTime = filteredData[index].time;
        endPower = Math.round(filteredData[index].power);
        formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
        index++;
        break;
      } else if(filteredData[index+1].power != filteredData[index].power)
      {
        //RAMP
        //LOOP UNTILL NEXT IS EQUAL
        for(let i = index;i<filteredData.length;i++)
        {
          if(i > 0)
          {
            prevPower = filteredData[i-1].power;
          }
          
          power = filteredData[i].power;

          if(i < filteredData.length - 1)
          {
            nextPower = filteredData[i+1].power;
          }
          
          if(i == filteredData.length - 1)
          {
            endTime = filteredData[i].time;
            endPower = Math.round(power);
            formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
            index = i+1;
            break;     
          } else if(power == nextPower)
          {
            endTime = filteredData[i].time;
            endPower = Math.round(prevPower);
            formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
            index = i;
            break;
          } else if(i > 0)
          {
            if(prevPower > power && power < nextPower) {
              endTime = filteredData[i].time;
              endPower = Math.round(power);
              formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
              index = i+1;
              break;
            } else if (prevPower < power && power > nextPower)
            {
              endTime = filteredData[i].time;
              endPower = Math.round(power);
              formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
              index = i+1;
              break;
            }
          }
        }
      } else if(filteredData[index+1].power == filteredData[index].power) {
        //FLAT
        //LOOP UNTILL NEXT IS DIFFERENT
        for(let i = index;i<filteredData.length;i++)
        {
          power = filteredData[i].power;
          nextPower = filteredData[i+1].power;

          if(i == filteredData.length - 1)
          {
            endTime = filteredData[i].time;
            endPower = Math.round(power);
            formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
            index = i+1;
            break;     
          } else if(power != nextPower)
          {
            endTime = nextPower != filteredData[i+2].power ? filteredData[i].time : filteredData[i+1].time;
            endPower = Math.round(power);
            formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
            index = nextPower != filteredData[i+2].power ? i : i+1;
            break;
          }
        }
      }
    }

    let zzz = { 
      original: data, filtered: filteredData, formatted: formattedData
    };

    res.status(201).send(zzz);
  })
  .catch((err) => {
      next(err);
  });
}

exports.processRaw = (req, res, next) => {
  WorkoutModel.getAllRaw()
  .then((result) => {  
    log(result.length + ' workouts loaded.');

    result.forEach(w => {
      log('Processing workout: ' + w.name);
      let data = w.data;
      let filteredData = [];
    
      filteredData = data;

      let formattedData = [];
      let startTime = filteredData[0].time;
      let endTime = 0;
      let startPower = filteredData[0].power;
      let endPower = 0;
      let index = 0;
      let prevPower = 0;
      let power = 0;
      let nextPower = 0;

      while(index < filteredData.length)
      {
        //SET START VALUES
        startTime = filteredData[index].time;
        startPower = Math.round(filteredData[index].power);
  
        if(filteredData[index].time == filteredData[index+1].time)
        {
          index++;
        } else 
        if(index == filteredData.length - 1)
        {
          //LAST ELEMENT
          endTime = filteredData[index].time;
          endPower = Math.round(filteredData[index].power);
          formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
          index++;
          break;
        } else if(filteredData[index+1].power != filteredData[index].power)
        {
          //RAMP
          //LOOP UNTILL NEXT IS EQUAL
          for(let i = index;i<filteredData.length;i++)
          {
            if(i > 0)
            {
              prevPower = filteredData[i-1].power;
            }
            
            power = filteredData[i].power;
  
            if(i < filteredData.length - 1)
            {
              nextPower = filteredData[i+1].power;
            }
            
            if(i == filteredData.length - 1)
            {
              endTime = filteredData[i].time;
              endPower = Math.round(power);
              formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
              index = i+1;
              break;     
            } else if(power == nextPower)
            {
              endTime = filteredData[i].time;
              endPower = Math.round(prevPower);
              formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
              index = i;
              break;
            } else if(i > 0)
            {
              if(prevPower > power && power < nextPower) {
                endTime = filteredData[i].time;
                endPower = Math.round(power);
                formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
                index = i+1;
                break;
              } else if (prevPower < power && power > nextPower)
              {
                endTime = filteredData[i].time;
                endPower = Math.round(power);
                formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
                index = i+1;
                break;
              }
            }
          }
        } else if(filteredData[index+1].power == filteredData[index].power) {
          //FLAT
          //LOOP UNTILL NEXT IS DIFFERENT
          for(let i = index;i<filteredData.length;i++)
          {
            if(i > 0)
            {
              prevPower = filteredData[i-1].power;
            }
            
            power = filteredData[i].power;
  
            if(i < filteredData.length - 1)
            {
              nextPower = filteredData[i+1].power;
            }
  
            if(i == filteredData.length - 1)
            {
              endTime = filteredData[i].time;
              endPower = Math.round(power);
              formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
              index = i+1;
              break;     
            } else if(power != nextPower)
            {
              endTime = nextPower != filteredData[i+2].power ? filteredData[i].time : filteredData[i+1].time;
              endPower = Math.round(power);
              formattedData.push({startTime: startTime / 1000, endTime: endTime / 1000, startPower: startPower, endPower: endPower});
              index = nextPower != filteredData[i+2].power ? i : i+1;
              break;
            }
          }
        }
      }

      let workout = {
        name: w.name,
        category: w.category != null ? w.category.replace(new RegExp('.[0-9]\.[0-9]'), '') : '',
        description: w.description,
        duration: formattedData[formattedData.length - 1].endTime,
        tss: Number(w.tss),
        data: formattedData,
        dateCreated: new Date()
      };

      WorkoutModel.add(workout)
      .then((result) => {
        log('Workout saved: ' + workout.name);        
      })
      .catch((err) => {
          next(err);
      });
    });
  })
  .catch((err) => {
    next(err);
  });
}

const newline = '\n';
const tab = '\t';

function log(msg)
{
  console.log(new Date() + ' - ' + msg);
}

function createMrcFile(workout)
{
  const mrcHeader = createHeader(workout.name, workout.description);
  const mrcData = createData(workout.data);

  return mrcHeader + newline + mrcData;
}

function createHeader(name, description)
{
  let mrcHeader = '[COURSE HEADER]' + newline;
  mrcHeader += 'VERSION = 2' + newline 
  mrcHeader += 'UNITS = ENGLISH' + newline
  mrcHeader += 'DESCRIPTION = ' + description + newline;
  mrcHeader += 'FILE NAME = ' + name.replace(' ', '_').replace('+', '').replace('-', '') + '.mrc' + newline;
  mrcHeader += 'MINUTES PERCENT' + newline;
  mrcHeader += '[END COURSE HEADER]'

  return mrcHeader;
}

function createData(data)
{
  let mrcData = '[COURSE DATA]' + newline;

  data.forEach(d => {
    mrcData += (d.startTime / 60) + tab + (d.startPower).toFixed(1) + newline;
    mrcData += (d.endTime / 60) + tab + (d.endPower).toFixed(1) + newline;
  });

  mrcData += '[END COURSE DATA]'

  return mrcData;
}