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
            var interval = parseInt($rootScope.properties.interval);
            var window = parseInt($rootScope.properties.window);
            var data = {
                rows: [],
                columns: [],
                values: [],
                maxValue: 0
            };
            var lastTimestamp = -1;
            var maxRow = -1;

            for (var i = 0; i < rawData.length; i++) {
                var instance = rawData[i];
                var row = parseInt(instance.key.split('-')[1]);
                data.rows.push(row);

                for(var j = 0; j < instance.values.length; j++) {
                    var timestamp = parseInt(instance.values[j].x / 1000);
                    if (timestamp > lastTimestamp) {
                        lastTimestamp = timestamp;
                    }
                    if (instance.values[j].y > data.maxValue) {
                        data.maxValue = instance.values[j].y;
                    }
                    if (instance.values[j].y > 0 && row > maxRow) {
                        maxRow = row;
                    }
                }
            }

            // not a single value found
            if (maxRow == -1) {
                return data;
            }

            data.rows.sort(function(a,b) { return b - a; }); // sort reversed numerical
            data.rows = data.rows.slice(data.rows.indexOf(maxRow));

            for (var ts = lastTimestamp - window * 60; ts <= lastTimestamp; ts += interval) {
                data.columns.push(ts);
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
                        var column = Math.ceil((timestamp - data.columns[0]) / interval);
                        //console.log("col:",column, "ts", timestamp, "first", data.columns[0], "int", interval);
                        data.values[column][rowIdx] += instance.values[j].y;
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
                .margin({top: 45, right: 0, bottom: 0, left: 0})
                .xAxisLabelFormat(timeFormat)
                .onMouseOver(function(d, i, j) {
                    var startRange = j + 1 == scope.hmData.rows.length ? 0 : scope.hmData.rows[j+1] + 1;
                    document.getElementById(scope.id + '-details').innerText =
                        "time: " + timeFormat(scope.hmData.columns[i]) +
                        ", range: " + startRange + " - " + scope.hmData.rows[j] +
                        ", count: " + parseInt(d);
                });

            scope.$on('updateMetrics', function () {
                scope.hmData = parseHeatmapData(scope.data);
                if(scope.hmData.values.length == 0) {
                    document.getElementById(scope.id + '-chart').innerText = "No data available.";
                    return;
                }

                heatmap
                    .xAxisLabels(scope.hmData.columns)
                    .yAxisLabels(scope.hmData.rows)
                    .colorScale(d3.scaleLinear()
                        .domain([0, scope.hmData.maxValue / 2, scope.hmData.maxValue])
                        .range(['#F5F5DC', '#FF5032', '#E50914'])
                    );
                d3.select("#" + scope.id + '-chart')
                    .html(null)
                    .datum(scope.hmData.values)
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
