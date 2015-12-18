var gulp = require('gulp');

var config = {
    paths: {
                js: ['./public/js/**/*.js', '!./public/js/application.js', '!./public/js/vendor.js'],
                css: ['./public/css/style.scss'],
                components: [
                './public/components/jquery/dist/jquery.min.js',
                './public/components/lodash/lodash.min.js'
                ]
            }
};

if (process.env.NODE_ENV === 'production') {
    require('./tasks/prod')(gulp, config);
} else {
    require('./tasks/dev')(gulp, config);
}