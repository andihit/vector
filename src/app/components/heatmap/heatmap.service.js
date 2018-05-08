/**!
 *
 *  Copyright 2018 Andreas Gerstmayr
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
 (function () {
     'use strict';

     /**
     * @name HeatmapService
     */
     function HeatmapService($rootScope) {

        function analyzeMetadata(rawData) {
            var interval = parseInt($rootScope.properties.interval),
                window = parseFloat($rootScope.properties.window);

            var data = {
                rows: [],
                columns: [],
                values: [],
                maxValue: 0
            };

            var maxRow = -1,
                lastTimestamp = -1;

            for (var i = 0; i < rawData.length; i++) {
                var instance = rawData[i];
                var row = parseInt(instance.key.split('-')[1]);
                data.rows.push(row);

                for(var j = 0; j < instance.values.length; j++) {
                    var timestamp = parseInt(instance.values[j].x / 1000);
                    if (timestamp > lastTimestamp) {
                        lastTimestamp = timestamp;
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

            var numCols = Math.ceil(window * 60 / interval);
            for (var c = numCols - 1; c >= 0; c--) {
                data.columns.push(lastTimestamp - interval * c);
                data.values.push(new Array(data.rows.length).fill(null));
            }

            return data;
        }

        function generate(rawData) {
            var interval = parseInt($rootScope.properties.interval);

            if (rawData.length == 0) {
                return data;
            }

            var data = analyzeMetadata(rawData, data);

            for (var i = 0; i < rawData.length; i++) {
                var instance = rawData[i];
                var row = parseInt(instance.key.split('-')[1]);
                var rowIdx = data.rows.indexOf(row);
                if (rowIdx == -1) {
                    // this row won't be displayed; skip immediately
                    continue;
                }

                for(var j = 0; j < instance.values.length; j++) {
                    var timestamp = parseInt(instance.values[j].x / 1000);
                    if (timestamp < data.columns[0]) {
                        continue;
                    }

                    var column = Math.ceil((timestamp - data.columns[0]) / interval);
                    data.values[column][rowIdx] += instance.values[j].y * interval;
                    if (data.values[column][rowIdx] > data.maxValue) {
                        data.maxValue = data.values[column][rowIdx];
                    }
                }
            }

            // multiply per-second values with interval
            for (var col = 0; col < data.values.length; col++) {
                for (var row = 0; row < data.values[col].length; row++) {
                    if (data.values[col][row]) {
                        //data.values[col][row] *= interval;
                    }
                }
            }

            return data;
        }

        return {
            generate: generate
        };
    }

    angular
        .module('heatmap')
        .factory('HeatmapService', HeatmapService);

 })();
