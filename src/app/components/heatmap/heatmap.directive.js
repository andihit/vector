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

 /*global d3*/

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

            if (rawData.length == 0) {
                return data;
            }

            for (let i = 0; i < rawData.length; i++) {
                var instance = rawData[i];
                var row = parseInt(instance.key.split('-')[1]);
                data.rows.push(row);

                for(let j = 0; j < instance.values.length; j++) {
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

            data.rows.sort(function(a,b) { return b - a; }); // sort reversed numerical
            if (maxRow == -1) {
                data.rows = data.rows.slice(-5); // show 5 rows per default
            }
            else {
                data.rows = data.rows.slice(data.rows.indexOf(maxRow));
            }

            for (let ts = lastTimestamp - window * 60; ts <= lastTimestamp; ts += interval) {
                data.columns.push(ts);
                data.values.push(new Array(data.rows.length).fill(null));
            }

            for (let i = 0; i < rawData.length; i++) {
                var instance = rawData[i];
                var row = parseInt(instance.key.split('-')[1]);
                var rowIdx = data.rows.indexOf(row);
                if (rowIdx == -1) {
                    // this row won't be displayed; skip immediately
                    continue;
                }

                for(let j = 0; j < instance.values.length; j++) {
                    var timestamp = parseInt(instance.values[j].x / 1000);
                    var column = Math.ceil((timestamp - data.columns[0]) / interval);
                    // TODO: remove if bug found
                    if (column >= data.values.length) {
                        console.log("ERROR col:",column, "ts", timestamp, "first", data.columns[0], "int", interval);
                    }
                    data.values[column][rowIdx] += instance.values[j].y;
                }
            }

            return data;
        }

        function timeFormat(ts, i) {
            if (i && i % 5 != 0) {
                return '';
            }

            var d = new Date(ts * 1000);
            return  (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' +
                    (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() + ':' +
                    (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();
        }

        function link(scope, element) {
            scope.id = D3Service.getId();
            scope.flags = $rootScope.flags;

            var heatmap = d3.heatmap()
                .margin({top: 45, right: 0, bottom: 0, left: 0})
                .xAxisLabelFormat(timeFormat)
                .onMouseOver(function(d, i, j) {
                    var startRange = j + 1 == scope.hmData.rows.length ? 0 : scope.hmData.rows[j+1] + 1;
                    document.getElementById(scope.id + '-details').innerText =
                        "time: " + timeFormat(scope.hmData.columns[i]) +
                        ", range: " + startRange + " - " + scope.hmData.rows[j] + ' ' + scope.unit +
                        ", count: " + (d == null ? 'no data' : parseInt(d));
                });

            scope.$on('updateMetrics', function () {
                scope.hmData = parseHeatmapData(scope.data);
                if(scope.hmData.values.length == 0) {
                    document.getElementById(scope.id + '-chart').innerText = "No data available.";
                    return;
                }

                var maxValue = Math.max(scope.hmData.maxValue, 1);
                heatmap
                    .width(element.width())
                    .xAxisLabels(scope.hmData.columns)
                    .colorScale(d3.scaleLinear()
                        .domain([0, maxValue / 2, maxValue])
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
                data: '=',
                unit: '='
            },
            link: link
        };
    }

    angular
        .module('chart')
        .directive('heatmap', heatmap);

})();
