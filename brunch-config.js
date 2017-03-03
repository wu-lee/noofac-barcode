// See http://brunch.io for documentation.
module.exports = {
    npm: {
/*        styles: {
            bootstrap: ['dist/css/bootstrap.css'],
        },*/
    },
    files: {
        javascripts: {
            joinTo: {
                'x/common.js': [
                    'node_modules/d3/**/d3.js',
                    'src/common.js',
                ],
            },
        },
        stylesheets: {joinTo: 'x/common.css'},
        templates: {joinTo: 'x/templates.js'}
    },
    paths: {
        watched: ['src'],
    },
    plugins: {
    },
    server: {
        noPushState: true,
    }
};
