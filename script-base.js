'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var angularUtils = require('./util.js');
var _ = require('underscore.string');
var inflection = require('inflection');

module.exports = yeoman.generators.NamedBase.extend({
    constructor: function ()
    {
        yeoman.generators.NamedBase.apply(this, arguments);

        try {
            this.appname = require(path.join(process.cwd(), 'bower.json')).name;
        } catch (e) {
            this.appname = path.basename(process.cwd());
        }
        this.appname = this._.slugify(this._.humanize(this.appname));
        this.scriptAppName = this._.camelize(this.appname);
        this.name = this.name
            .replace(/^\//, '') //remove leading slashes
            .replace(/\/$/, ''); //remove ending slashes
        if(this.name.indexOf('/') > -1) {
            this.name = this.name.replace(/\//g, '.')
        }
        this.dottedName = this.name;
        if(this.name.indexOf('.') > -1) {
            this.name = this.name.replace(/\./g, '/')
        }
        this.hierarchy = this.name.split('/');

        this.slugifiedPath = this.hierarchy.map(function (folder) { //Generate a slugified name
            return dasherize(folder);
        });
        this.slugifiedPath.pop(); //remove the last element in the array, namely the name

        this.name = last(this.hierarchy);

        function last(arr) {
            return arr[arr.length - 1];
        }

        function dasherize(str) {
            return _.slugify(
                str.replace(/(?:^[A-Z]{2,})/g, function (match) { //XMLfileIsCool -> xml-fileIsCool
                    return match.toLowerCase() + "-";
                })
                    .replace(/(?:[A-Z]+)/g, function (match) { //camelCase -> snake-case
                        return "-" + match.toLowerCase();
                    })
                    .replace(/^-/, '')
            ); // CamelCase -> -snake-case -> snake-case);
        };

        this.cameledName = this._.camelize(this.name);
        this.dasherizedName = dasherize(this.name);
        this.pluralizedName = inflection.pluralize(this.name);
        this.classedName = this._.classify(this.name);

        var nameParts = [].concat(this.slugifiedPath);
        nameParts.push(this.dasherizedName);
        this.dasherizedFullName = nameParts.join('-');
        this.cameledFullName = this._.camelize(this.dasherizedFullName);
        this.classedFullName = this._.classify(this.dasherizedFullName);


        if (typeof this.env.options.appPath === 'undefined') {
            try {
                this.env.options.appPath = require(path.join(process.cwd(), 'bower.json')).appPath;
            } catch (e) {
            }
            this.env.options.appPath = this.env.options.appPath || 'public';
        }
        this.appPath = this.env.options.appPath;

        if (typeof this.env.options.testPath === 'undefined') {
            try {
                this.env.options.testPath = require(path.join(process.cwd(), 'bower.json')).testPath;
            } catch (e) {
            }
            this.env.options.testPath = this.env.options.testPath || 'test/spec';
        }

        this.scriptSuffix = '.js';

        this.sourceRoot(path.join(__dirname, '/'));
    },
    appTemplate: function (src, dest) {
        yeoman.generators.Base.prototype.template.apply(this, [
            src + this.scriptSuffix,
            path.join(this.env.options.appPath, dest) + this.scriptSuffix
        ]);
    },

    testTemplate: function (src, dest) {
        yeoman.generators.Base.prototype.template.apply(this, [
            src + this.scriptSuffix,
            path.join(this.env.options.testPath, dest) + this.scriptSuffix
        ]);
    },

    htmlTemplate: function (src, dest) {
        yeoman.generators.Base.prototype.template.apply(this, [
            src,
            path.join(this.env.options.appPath, dest)
        ]);
    },

    appendStyleToScss: function (target, style) {
        try {
            var appPath = this.env.options.appPath;
            var fullPath = path.join(appPath, 'styles', target);
            angularUtils.appendFile({
                file: fullPath,
                lines: [
                    '@import \'' + style + '\';'
                ]
            });
        } catch (e) {
            console.log('\nUnable to find '.yellow + fullPath + '.');
        }
    },

    addStyleToStateScss: function (style) {
        this.appendStyleToScss('_states.scss', style);
    },

    addStyleToComponentScss: function (style) {
        this.appendStyleToScss('_components.scss', style);
    },
    addStyleToModalScss: function (style) {
        this.appendStyleToScss('_modals.scss', style);
    },

    generateSourceAndTest: function (appTemplate, testTemplate, targetDirectory, testTargetDirectory, targetFilename) {
        this.appTemplate(appTemplate, path.join('scripts', targetDirectory, targetFilename || this.dasherizedName));
        this.testTemplate(testTemplate, path.join(testTargetDirectory || targetDirectory, targetFilename || this.dasherizedName));
    }
});


