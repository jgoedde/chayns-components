const gulp = require('gulp');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const sass = require('gulp-sass');
const concatCss = require('gulp-concat-css');
const path = require('path');
const pkg = require('./package.json');

const jsSource = [
    'src/**/*.{js,jsx}',
    '!src/**/*.{stories,spec,test}.{js,jsx}',
];
const cssSource = 'src/**/*.{css,scss}';

/** ======================
 ========= CLEAN =========
 ====================== */

gulp.task('clean', () =>
    gulp.src(['dist/', 'split-css/'], { allowEmpty: true }).pipe(clean())
);

/** ======================
 ========== ESM ==========
 ====================== */

const esmDestination = path.dirname(pkg.module);

gulp.task('transpile-esm', () =>
    gulp
        .src(jsSource)
        .pipe(
            babel({
                presets: [['./babelPreset.js', { cssImports: 'rename' }]],
            })
        )
        .pipe(gulp.dest(esmDestination))
);

gulp.task('compile-scss-esm', () =>
    gulp.src(cssSource).pipe(sass()).pipe(gulp.dest(esmDestination))
);

gulp.task('build-esm', gulp.parallel('transpile-esm', 'compile-scss-esm'));

/** ======================
 ========== CJS ==========
 ====================== */

const cjsDestination = path.dirname(pkg.main);

gulp.task('transpile-cjs', () =>
    gulp
        .src(jsSource)
        .pipe(
            babel({
                presets: [
                    ['./babelPreset.js', { cjs: true, cssImports: 'rename' }],
                ],
            })
        )
        .pipe(gulp.dest(cjsDestination))
);

gulp.task('compile-scss-cjs', () =>
    gulp.src(cssSource).pipe(sass()).pipe(gulp.dest(cjsDestination))
);

gulp.task('build-cjs', gulp.parallel('transpile-cjs', 'compile-scss-cjs'));

/** ======================
 ===== CJS CSS-SPLIT =====
 ====================== */

gulp.task('transpile-cjs-split-css', () =>
    gulp
        .src(jsSource)
        .pipe(
            babel({
                presets: [
                    ['./babelPreset.js', { cjs: true, cssImports: 'remove' }],
                ],
            })
        )
        .pipe(gulp.dest('dist/cjs-split-css/'))
);

gulp.task('bundle-css', () =>
    gulp
        .src(cssSource)
        .pipe(sass())
        .pipe(concatCss('styles.css'))
        .pipe(gulp.dest('dist/'))
);

gulp.task(
    'build-cjs-split-css',
    gulp.parallel('transpile-cjs-split-css', 'bundle-css')
);

/** ======================
 = resolveAbsoluteImport =
 ====================== */

gulp.task('compile-resolve-import', () =>
    gulp
        .src('src/**/resolveAbsoluteImport.js')
        .pipe(
            babel({
                presets: [['./babelPreset.js', { cjs: true }]],
            })
        )
        .pipe(gulp.dest('lib/'))
);

/** ======================
 ========= BUILD =========
 ====================== */

gulp.task(
    'build',
    gulp.series(
        'clean',
        gulp.parallel(
            'build-esm',
            'build-cjs',
            'build-cjs-split-css',
            'compile-resolve-import'
        )
    )
);

// =======================
