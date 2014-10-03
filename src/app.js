/* globals sourceMap: false, angular: false, CodeMirror: falseGG */
angular.module('source-map-viz', [])

.controller('MainAppCtrl', function ($scope) {

  var SourceMapConsumer = sourceMap.SourceMapConsumer;

  var smc;

  $scope.model = {
    rawSourceMap: null,
    selectedSource : null,
    line: null,
    col: null,
  };

  $scope.$watch('model.rawSourceMap', function (value) {
    if (value) {
      var rawSourceMap = angular.fromJson(value);
      smc = new SourceMapConsumer(rawSourceMap);
      $scope.sources = smc.sources;
    }
  });

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

.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                };
                reader.readAsText(changeEvent.target.files[0]);
            });
        }
    };
}]);


;



;
