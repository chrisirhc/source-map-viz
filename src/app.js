/* globals sourceMap: false, angular: false, CodeMirror: falseGG */
angular.module('source-map-viz', [])

.controller('MainAppCtrl', function ($scope) {

  var rawSourceMap = {"version":3,"file":"demo.min.js","sources":["../src/demo.js"],"names":["iAmAFunction","i","console","log"],"mappings":";;AAEA,QAASA,iBAFT,GAAIC,GAAI,CAMRC,SAAQC,IAAI","sourcesContent":["var i = 1;\n\nfunction iAmAFunction() {\n    var cool = 2;\n}\n\nconsole.log('hello world');"]};

  var SourceMapConsumer = sourceMap.SourceMapConsumer;

  var smc = new SourceMapConsumer(rawSourceMap);

  window.smc = smc;

  $scope.model = {
    selectedSource : null,
    line: null,
    col: null,
  };

  $scope.sources = smc.sources;

  $scope.$watch('model.selectedSource', function (value) {
    if (!value) {
      $scope.sourceContent = null;
      return;
    }

    $scope.sourceContent = smc.sourceContentFor(value);
    $scope.sourceMappings = [];

    smc.eachMapping(function (m) {
      if (m.source == value) {
        $scope.sourceMappings.push(m);
      }
    }, null, SourceMapConsumer.ORIGINAL_ORDER);

  });

  $scope.$watchGroup(['model.line', 'model.col'], function (values) {
    var line = values[0];
    var col = values[1];
    if (line >= 1 && col >= 1) {
      console.log(smc.originalPositionFor({
        line: line,
        column: col,
      }));
    }
  });

})


.directive('codeMirror', function () {
  return {
    // scope: {
    //   value: '=',
    // },

    link: function (scope, element) {
      var editor = CodeMirror.fromTextArea(element[0], {
        lineNumbers: true,
        mode: 'javascript',
        theme: 'tomorrow-night-eighties',
        readOnly: true,
      });

      scope.$watch('sourceContent', function (value) {
        editor.setValue(value || '');

        if (value) {
          // loop through sourceContent and mark text
          var prevM;
          scope.sourceMappings.forEach(function (m) {
            var thisM = prevM;
            if (prevM) {
              editor.markText({
                line: thisM.originalLine,
                ch: thisM.originalColumn,
              }, {
                line: m.originalLine,
                ch: m.originalColumn,
              }, {
                className: 'test-highlight',
              })
              .on('beforeCursorEnter', function () {
                scope.model.line = thisM.generatedLine;
                scope.model.col = thisM.generatedColumn;
                scope.$apply();
              });
            }
            prevM = m;
          });
        }
      });
    }
  };
})


;



;
