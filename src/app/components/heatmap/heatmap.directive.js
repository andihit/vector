/**!
 *
 *  Copyright 2018 Andreas Gerstmayr.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 */

 /*global d3, nv*/

(function () {
    'use strict';

    function heatmap($rootScope, D3Service) {

        function parseHeatmapData(rawData) {
            var data = {
                rows: [],
                values: [],
                maxValue: 0,
                minTime: 0,
                maxTime: 0
            };
            var maxRow = -1;

            for (var i = 0; i < rawData.length; i++) {
                var instance = rawData[i];
                var row = parseInt(instance.key.split('-')[1]);
                data.rows.push(row);

                for(var j = 0; j < instance.values.length; j++) {
                    var timestamp = parseInt(instance.values[j].x / 1000);
                    data.maxTime = Math.max(data.maxTime, timestamp);
                    data.maxValue = Math.max(data.maxValue, instance.values[j].y);
                    if (instance.values[j].y > 0) {
                        maxRow = Math.max(maxRow, row);
                    }
                }
            }

            // $rootScope.properties.window is measured in minutes
            data.minTime = data.maxTime - $rootScope.properties.window * 60;

            data.rows.sort(function(a,b) { return b - a; }); // sort reversed numerical
            if (maxRow == -1) {
                // not a single value found, show only first row
                data.rows = data.rows[data.rows.length - 1];
            }
            else {
                // show only rows (buckets) with values
                data.rows = data.rows.slice(data.rows.indexOf(maxRow));
            }

            for(var i = 0; i < data.maxTime - data.minTime + 1; i++) {
                data.values.push(new Array(data.rows.length).fill(0));
            }

            for (var i = 0; i < rawData.length; i++) {
                var instance = rawData[i];
                var row = parseInt(instance.key.split('-')[1]);
                var rowIdx = data.rows.indexOf(row);
                if (rowIdx == -1) {
                    // this row has no value > 0; skip immediately
                    continue;
                }

                for(var j = 0; j < instance.values.length; j++) {
                    if (instance.values[j].y > 0) {
                        var timestamp = parseInt(instance.values[j].x / 1000);
                        var column = timestamp - data.minTime;
                        data.values[column][rowIdx] = instance.values[j].y;
                    }
                }
            }

            return data;
        }

        function timeFormat(ts) {
            var d = new Date(ts * 1000);
            return  (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' +
                    (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() + ':' +
                    (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();
        }

        function link(scope, element) {
            scope.id = D3Service.getId();

            var heatmap = d3.heatmap()
                .width(element.width())
                .xAxisScaleTicks(5)
                .xAxisTickFormat(timeFormat);

            /*heatmap.onMouseOver = function(d, i, j) {
				document.getElementById(scope.id + '-details').innerText = "time: " + data.columns[i] + ", range: " + data.rows[j] + ", count: " + d;
            };*/

            scope.$on('updateMetrics', function () {
                var hmData = parseHeatmapData(scope.data);
                //console.log(hmData);

                heatmap
                    .xAxisScale([hmData.minTime, hmData.maxTime])
                    .yAxisLabels(hmData.rows)
                    .colorScale(d3.scaleLinear()
                        .domain([0, hmData.maxValue / 2, hmData.maxValue])
                        .range(['#F5F5DC', '#FF5032', '#E50914'])
                    );

                d3.select("#" + scope.id + '-chart')
                    .html(null)
                    .datum(hmData.values)
                    .call(heatmap);
            });
        }

        return {
            restrict: 'A',
            templateUrl: 'app/components/heatmap/heatmap.html',
            scope: {
                data: '='
            },
            link: link
        };
    }

    angular
        .module('chart')
        .directive('heatmap', heatmap);

})();
