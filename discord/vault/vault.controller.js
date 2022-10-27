const https = require('https');
const VaultModel = require('./vault.model');
const puppeteer = require('puppeteer');
const { filter } = require('compression');

exports.get = async (req, res, next) => {
    const page = req.body.page != null ? parseInt(req.body.page) : 0;
    const limit = req.body.limit > 0 ? parseInt(req.body.limit) : 50;
    const channel = req.body.channel;
    const skipIndex = page * limit;
  
    try {
      const count = await VaultModel.getCount(channel);
      const results = await VaultModel.get(channel)
        .sort({timestamp: 1})
        .limit(limit)
        .skip(skipIndex)
        .exec();
  
      const data = {count: count, data: results};
      res.status(201).send(data);
    } catch(e) {
      console.log(e);
      res.status(500).json({ message: "Error Occured" });
    }
  }