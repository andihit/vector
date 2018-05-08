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

    function heatmap($rootScope, $document, D3Service, HeatmapService, UnitService) {

        function timeFormat(ts, i) {
            if (i && i % 5 != 0) {
                return '';
            }

            var d = new Date(ts * 1000);
            return  (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' +
                    (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() + ':' +
                    (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();
        }

        function onMouseOver(scope, d, i, j) {
            var startRange = j + 1 == scope.hmData.rows.length ? 0 : scope.hmData.rows[j+1] + 1;
            var units = UnitService.convert(startRange, scope.hmData.rows[j], scope.unit);
            $document.find('#' + scope.id + '-details').text(
                "time: " + timeFormat(scope.hmData.columns[i]) +
                ", range: " + units[0] + " - " + units[1] + ' ' + units[2] +
                ", count: " + (d == null ? 'no data' : Math.round(d))
            );
        }

        function link(scope, element) {
            scope.id = D3Service.getId();
            scope.flags = $rootScope.flags;

            var heatmap = d3.heatmap()
                .margin({top: 45, right: 0, bottom: 0, left: 0})
                .xAxisLabelFormat(timeFormat)
                .onMouseOver(onMouseOver.bind(this, scope));

            scope.$on('updateMetrics', function () {
                scope.hmData = HeatmapService.generate(scope.data);
                if(scope.hmData.values.length == 0) {
                    $document.find('#' + scope.id + '-chart').text('No data available.');
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
        .module('heatmap')
        .directive('heatmap', heatmap);

})();
