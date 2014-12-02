module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    less: {
      build: {
        files: {
          'public/css/main.css'   : 'less/main.less'
        }
      }
    },
    watch: {
      css: {
        files: ['less/**/*.less'],
        tasks: ['less']
      }
    },

  });

  // load nodemon
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  // register the nodemon task when we run grunt
  grunt.registerTask('default', ['less']);  
};  