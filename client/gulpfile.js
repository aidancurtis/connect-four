const gulp = require("gulp");
const terser = require("gulp-terser");
const sass = require("gulp-sass");
const uglifycss = require("gulp-uglifycss");
const concat = require("gulp-concat");

/*
    -- TOP LEVEL FUNCTIONS --
    gulp.task - define tasks
    gulp.src - point tofiles to use
    gulp.dest - points to folder to output
    gulp.watch - watch files and folders for changes
*/

// logs messages
gulp.task("message", async () => {
  return console.log("Gulp is running...");
});

// copy all HTML files
gulp.task("copyHTML", async () => {
  gulp.src("src/*.html").pipe(gulp.dest("build"));
});

// minify JS
gulp.task("minifyJS", async () => {
  gulp.src("src/scripts/*.js").pipe(terser()).pipe(gulp.dest("build/scripts"));
});

// minify css and move to build
gulp.task("css", async () => {
  gulp
    .src("src/styles/*.css")
    .pipe(
      uglifycss({
        uglyComments: true,
      })
    )
    .pipe(gulp.dest("build/styles"));
});

// compile sass
gulp.task("sass", async () => {
  gulp.src("src/styles/*.scss").pipe(sass()).pipe(gulp.dest("src/styles"));
});

gulp.task("watch", async () => {
  gulp.watch("src/styles/*.scss", gulp.parallel("sass"));
});
