'use strict';
var util = require('util');
var ScriptBase = require('../script-base.js');
var path = require('path');


module.exports = ScriptBase.extend({
    createFilterFiles: function () {

        var filePath = ['scripts', 'filters'].concat(this.slugifiedPath).join('/');

        this.template(
            'filter/filter-tpl.js',
            path.join(this.appPath, filePath, this.dasherizedFullName + '-filter.js')
        );
        this.gruntLink();
    }
});
