var gulp = require('gulp');

var config = {
    paths: {
                js: [
                        './node_modules/socket.io/node_modules/socket.io-client/socket.io.js',
                        './public/components/jquery/dist/jquery.min.js',
                        './public/components/lodash/lodash.min.js',
                        './public/js/**/*.js',
                        '!./public/js/application.js'
                    ],
                css: ['./public/css/style.scss']
            }
};

if (process.env.NODE_ENV === 'production') {
    require('./tasks/prod')(gulp, config);
} else {
    require('./tasks/dev')(gulp, config);
}