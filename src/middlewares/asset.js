'use strict';

import path from 'path';
import fs from 'fs-extra';
import cp from 'child_process';
import crypto from 'crypto';
import send from 'koa-send';
import buildify from 'buildify';

const DEFAULT_ASSETS_CONFIG = {
  minify: false,
  baseUrl: '/build/',
  maxBuffer: 2000 * 1024
};

export default class Asset {

  /**
   * Asset middleware
   * @param  {Object} app
   */
  constructor(app) {
    this.app = app;
    this.config = _.merge({}, DEFAULT_ASSETS_CONFIG, app.configs.assets || {});

    this.baseUrl = this.config.baseUrl;
    this.rawAssetsPath = path.join(app.rootPath, 'assets');
    this.minifiedAssetsPath = path.join(app.tmpPath, 'assets');

    fs.ensureDirSync(this.rawAssetsPath);
    fs.ensureDirSync(this.minifiedAssetsPath);

    this.assetsMtime = this.getAssetsMtime();    

    this.uglifyBin = path.join(this.app.npmBinPath, 'uglifyjs');
    this.cleancssBin = path.join(this.app.npmBinPath, 'cleancss');
    this.minify = (this.config.minify !== false);

    if (!this.baseUrl.endsWith('/')) {
      this.baseUrl = this.baseUrl + '/';
    }

    this.use();

    app.debug('middleware - asset loaded');
  }

  getAssetsMtime() {
    return fs.statSync(this.rawAssetsPath).mtime;
  }  

  /**
   * Use middlewares
   */
  use() {
    if (this.minify) {
      this.syncAssetsHash();
      this.useMinifiedAssets();
    } else {
      this.assets = { js: this.config.js, css: this.config.css };      
      this.useRawAssets();
    }
  }

  /**
   * Use minifed assets
   */
  useMinifiedAssets() {
    const self = this;
    const options = { root: this.minifiedAssetsPath, index: 'index.html' };

    this.app.server.use(async function(ctx, next) {
      // Regenerate assets hash when any asset changes
      if (self.getAssetsMtime() != self.assetsMtime) {
        self.syncAssetsHash();
        self.assetsMtime = self.getAssetsMtime();
      }

      // Pass assets variable to view
      ctx.state.assets = self.htmlTags(self.baseUrl, self.assets);
      await next();

      if (ctx.method != 'HEAD' && ctx.method != 'GET') return;
      if (!ctx.path.match(/.*\.js$/) && !ctx.path.match(/.*\.css$/)) return;

      // Response is already handled
      if (ctx.body != null || ctx.status != 404) return;

      // Render assets when url matches
      const validPath = self.getValidPath(self.baseUrl);
      if (ctx.path.startsWith(validPath)) {
        let file = ctx.path.replace(/.*\/([^\/]+)$/, '$1');

        // Pipline assets
        await self.process(file);
        await send(ctx, '/' + file, options);
      }
    });
  }

  /**
   * Use raw assets
   */
  useRawAssets() {
    const self = this;

    const options = {
      root: this.rawAssetsPath,
      index: 'index.html'
    };

    this.app.server.use(async function(ctx, next) {
      // Pass assets variable to view
      ctx.state.assets = self.htmlTags('/', self.assets);
      await next();

      if (ctx.method != 'HEAD' && ctx.method != 'GET') return;

      // Response is already handled
      if (ctx.body != null || ctx.status != 404) return;

      await send(ctx, ctx.path, options);
    });
  }

  /**
   * Save assets hash
   * @return {[type]} [description]
   */
  syncAssetsHash() {
    this.assets = this.genAssetsHash();
  }

  /**
   * Generate assets hash
   */
  genAssetsHash() {
    let self = this;
    let md5HashPool = { };
    let tasks = [];
    let assets = {js: {}, css: {}};

    // Generate hash by group
    var groupAssetsHash = function(pool, assets) {
      var hash = '';

      for(let asset of assets) {
        var md5 = '';
        if (pool[asset]) {
          md5 = pool[asset];
        } else {
          let assetFile = path.join(self.rawAssetsPath, asset);
          md5 = crypto.createHash('md5').update(fs.readFileSync(assetFile)).digest('hex');
          pool[asset] = md5;
        }
        hash += md5;        
      }

      return crypto.createHash('md5').update(hash).digest('hex');
    };

    _.forEach(self.config.js, (jsAssets, group) => {
      if (jsAssets.length > 0) {
        let hash = groupAssetsHash(md5HashPool, jsAssets);
        assets.js[group] = group + '-' + hash + '.js';        
      }
    });

    _.forEach(self.config.css, (cssAssets, group) => {
      if (cssAssets.length > 0) {
        let hash = groupAssetsHash(md5HashPool, cssAssets);
        assets.css[group] = group + '-' + hash + '.css';        
      }
    });

    return assets;
  }

  /**
   * Html tags
   * @param  {String} baseUrl Assets prefix path or url
   * @param  {Array}  assets  Assets hash
   * @return {Object}         Html tags
   */
  htmlTags(baseUrl, assets) {
    var htmlTags = { js: {}, css: {} };

    // js tags
    _.forEach(assets.js, (jsAssets, group) => {
      var jsTag = '';
      if (typeof jsAssets == 'string') {
        jsTag = '\n    <script src="' + baseUrl + jsAssets + '"></script>';
      } else if (Array.isArray(jsAssets)) {
        for(let js of jsAssets) {
          jsTag += ('\n    <script src="' + baseUrl + js + '"></script>');
        }
      }
      htmlTags.js[group] = jsTag;
    });

    // css tags
    _.forEach(assets.css, (cssAssets, group) => {
      var cssTag = '';
      if (typeof cssAssets == 'string') {
        cssTag = '\n    <link type="text/css" rel="stylesheet" href="' + baseUrl + cssAssets + '" media="all" />';
      } else if (Array.isArray(cssAssets)) {
        for(let css of cssAssets) {
          cssTag += ('\n    <link type="text/css" rel="stylesheet" href="' + baseUrl + css + '" media="all" />');
        }
      }
      htmlTags.css[group] = cssTag;
    });

    return htmlTags;
  }

  /**
   * Patch base url
   * @param  {String} baseUrl Raw url
   * @return {String}         Patched url
   */
  getValidPath(baseUrl) {
    if (baseUrl.match(/^https?:\/\//)) {
      return baseUrl.replace(/^https?:\/\/[^\/]+(\/.*)$/, '$1');
    } else {
      return baseUrl;
    }
  }

  /**
   * Completion input paths
   * @param  {Array} paths Raw paths
   * @return {Array}       Completed paths
   */
  completionPaths(paths) {
    let ret = [];
    _.forEach(paths, (p) => {
      ret.push(path.join(this.rawAssetsPath, p));
    });

    return ret;
  }

  /**
   * Compress raw files to the minifed file
   * @param  {String} file Dest file
   */
  process(file) {
    const self = this;
    const assets = this.assets || { js: {}, css: {} };

    const outputFile = path.join(this.minifiedAssetsPath, file);
    if (_.fileExists(outputFile)) {
      return;
    }

    const group = file.replace(/^(.+)\-[0-9a-z]+\.(css|js)$/, '$1');

    // Compress js files
    if (file.match(/.*\.js$/)) {
      if (assets.js[group] != file) {
        return;
      }

      let inputFiles = self.completionPaths(self.config.js[group]);
      let cmd = [ self.uglifyBin, inputFiles.join(' '), '-o ' + outputFile ].join(' ');

      return new Promise((resolve) => {
        cp.exec(cmd, {maxBuffer: self.config.maxBuffer}, function(err, stdout, stderr) {
          resolve();
        });        
      });      
    }

    // Compress css files
    if (file.match(/.*\.css$/)) {
      if (assets.css[group] != file) {
        return;
      }

      let inputFiles = self.completionPaths(self.config.css[group]);
      let cmd = [ self.cleancssBin, outputFile, '-o ' + outputFile ].join(' ');

      buildify('/', {quiet: true}).concat(inputFiles).save(outputFile);

      return new Promise((resolve) => {
        cp.exec(cmd, {maxBuffer: self.maxBuffer}, function(err, stdout, stderr) {
          resolve();
        });
      });
    }
  }

}