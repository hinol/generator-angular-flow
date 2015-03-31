'use strict';
var path = require('path');
var util = require('util');
var angularUtils = require('../util.js');
var spawn = require('child_process').spawn;
var yeoman = require('yeoman-generator');


module.exports = yeoman.generators.Base.extend({
    constructor: function (args, options) {
        yeoman.generators.Base.apply(this, arguments);

        //if (typeof this.env.options.appPath === 'undefined') {
        //    try {
        //        this.env.options.appPath = require(path.join(process.cwd(), 'bower.json')).appPath;
        //    } catch (e) {
        //        this.env.options.appPath = this.env.options.appPath || 'public';
        //    }
        //}
        //this.appPath = this.env.options.appPath;

        //this.on('end', function () {
        //    this.installDependencies({skipInstall: this.options['skip-install']});
        //});

        this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
    },

    default: function(){
        var appPath = this.config.get('appPath');
        if(appPath) {
            // modify existing app
            console.log('app path is: ', appPath);
        } else {
            // ask if you want to crate new app
            this.log('____________________________________________________________________________');
            this.log('');
            this.log('Welcome to generator-angular-flow!!!');
            this.log('AngularJs Yeoman generator for large application.');
            this.log('____________________________________________________________________________');
            this.log('');
            this.log('Project not found');

            this.prompt({
                type: 'confirm',
                name: 'start',
                message: 'Do you want to create new project',
                default: true
            }, function (answers) {
                if(answers.start) {
                    this._startNewApp();
                }
            }.bind(this));
        }
    },

    /**
     * init new app
     */
    _startNewApp: function () {

        this.prompt([
            {
                type: 'input',
                name: 'baseDir',
                message: 'base directory',
                default: './' // Default to current folder
            },
            {
                type: 'input',
                name: 'basePath',
                message: 'Your angular app module name',
                default: '/' // Default to current folder name
            }
        ], function (answers) {
            this.config.set(answers);
            this.config.save();
        }.bind(this));
    },

    /**
     * ask for extra modules you want to include in your app
     */
    _promptModules: function () {
        var done = this.async();
        var modules = require('./module-list.js');
        var choices = [];
        for (var m in modules) {
            choices.push({
                value: modules[m],
                name: modules[m].name+' ('+modules[m].version+')',
                checked: !!modules[m].checked
            });
        }
        var prompts = [
            {
                type: 'checkbox',
                name: 'modules',
                message: 'Which modules would you like to include?',
                choices: choices
            }
        ];

        this.prompt(prompts, function (props) {

            this.bowerComponents = '';
            var angMods = [
                "ngAnimate",
                "ajoslin.promise-tracker",
                "cgBusy",
                "chieffancypants.loadingBar",
                "ui.router",
                "ui.bootstrap"
            ];
            for (var m in props.modules) {
                if(props.modules[m].moduleName) {
                    angMods.push(props.modules[m].moduleName);
                }
                if(props.modules[m].bowerName) {
                    this.bowerComponents = this.bowerComponents+',\n        "'+props.modules[m].bowerName+'": "'+props.modules[m].version+'"';
                }
            }
            this.angularModules = "\n    '" + angMods.join("',\n    '") + "'\n";
            done();
        }.bind(this));
    },

    /**
     * now all data are ready so create all required files
     */
    _createAppFiles: function () {
        /**
         * copy root files and directories
         */
        this.directory('root-tpls', '.');

        /**
         * copy public files and directories
         */
        this.directory('public-tpls', this.appPath);

        /**
         * create single files witch can't be process in batch
         *
         * .gitignore
         * Gruntfile.js
         */
        //TODO if file already exist, add the content to it
        this.src.copy('gitignore', '.gitignore');
        this.src.copy('gruntfile-tpl.js', 'Gruntfile.js');
    }
});
