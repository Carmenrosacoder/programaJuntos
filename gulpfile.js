var gulp = require('gulp');
var webserver = require('gulp-webserver');

gulp.task('default', function() {
  	gulp.src('public')
		.pipe(webserver({
			host: 'localhost',
			port: 8000,
			livereload: true,
			directoryListing: false,
      open: true
	}));
});
