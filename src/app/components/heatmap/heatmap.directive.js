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

    function heatmap($rootScope, $timeout, D3Service) {

        function parseHeatmapData(rawData) {
            var data = {
                rows: [],
                values: [],
                maxValue: 0,
                minTime: 0,
                maxTime: 0
            };

            for (var i = 0; i < rawData.length; i++) {
                var instance = rawData[i];
                var row = parseInt(instance.key.split('-')[1]);
                data.rows.push(row);

                for(var j = 0; j < instance.values.length; j++) {
                    var timestamp = parseInt(instance.values[j].x);
                    data.minTime = data.minTime == 0 ? timestamp : Math.min(data.minTime, timestamp);
                    data.maxTime = Math.max(data.maxTime, timestamp);
                    data.maxValue = Math.max(data.maxValue, instance.values[j].y);
                }
            }
            data.rows.sort();

            for(var i = 0; i < data.maxTime - data.minTime + 1; i++) {
                data.values.push(new Array(data.rows.length).fill(0));
            }

            for (var i = 0; i < rawData.length; i++) {
                var instance = rawData[i];
                var row = parseInt(instance.key.split('-')[1]);
                var rowIdx = data.rows.indexOf(row);

                for(var j = 0; j < instance.values.length; j++) {
                    if (instance.values[j].y > 0) {
                        var timestamp = parseInt(instance.values[j].x);
                        var column = timestamp - data.minTime;
                        data.values[column][rowIdx] = instance.values[j].y;
                    }
                }
            }

            return data;
        }

        function link(scope, element) {
            scope.id = D3Service.getId();

            var heatmap = d3.heatmap()
                .width(element.width())
                .xAxisTickFormat(function(v) { var d = new Date(v); return d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();});

            /*heatmap.onMouseOver = function(d, i, j) {
				document.getElementById(scope.id + '-details').innerText = "time: " + data.columns[i] + ", range: " + data.rows[j] + ", count: " + d;
            };*/

            scope.$on('updateMetrics', function () {
                //var hmData = parseHeatmapData(scope.data);
                var hmData = parseHeatmapData([
                    {key: '0-1023',    values:[{x:1525054930,y:0},{x:1525054931,y:1},{x:1525054932,y:0},{x:1525054933,y:0},{x:1525054934,y:1},{x:1525054935,y:0}]},
                    {key: '1024-2047', values:[{x:1525054930,y:5},{x:1525054931,y:5},{x:1525054932,y:1},{x:1525054933,y:0},{x:1525054934,y:1},{x:1525054935,y:0}]},
                    {key: '2048-4095', values:[{x:1525054930,y:2},{x:1525054931,y:3},{x:1525054932,y:10},{x:1525054933,y:0},{x:1525054934,y:1},{x:1525054935,y:0}]},
                    {key: '4096-8191', values:[{x:1525054930,y:0},{x:1525054931,y:1},{x:1525054932,y:0},{x:1525054933,y:0},{x:1525054934,y:1},{x:1525054935,y:0}]}
                ]);
                console.log(hmData);

                heatmap
                    .xAxisScale([hmData.minTime, hmData.maxTime])
                    .xAxisScaleTicks(5)
                    .yAxisScale([0, Math.max.apply(null, hmData.rows)])
                    .colorScale(d3.scaleLinear()
                        .domain([0, hmData.maxValue / 2, hmData.maxValue])
                        .range(['#F5F5DC', '#FF5032', '#E50914'])
                    );

                d3.select("#" + scope.id + '-chart')
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
