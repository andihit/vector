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

 /*global _*/

 (function () {
     'use strict';

    /**
    * @name BccDiskLatencyMetricDataModel
    * @desc
    */
    function BccDiskLatencyMetricDataModel(WidgetDataModel, MetricListService, DashboardService) {
        var DataModel = function () {
            return this;
        };

        DataModel.prototype = Object.create(WidgetDataModel.prototype);

        DataModel.prototype.init = function () {
            WidgetDataModel.prototype.init.call(this);

            this.name = this.dataModelOptions ? this.dataModelOptions.name : 'metric_' + DashboardService.getGuid();

            var latencyMetric = MetricListService.getOrCreateCumulativeMetric('bcc.disk.all.latency'),
                derivedFunction;

            derivedFunction = function () {
                var returnValues = [],
                    lastValue;

                if (latencyMetric.data.length > 0) {
                    for(var i = 0; i < latencyMetric.data.length; i++) {
                        var instance = latencyMetric.data[i];
                        if (instance.values.length > 0) {
                            lastValue = instance.values[instance.values.length - 1];
                            returnValues.push({
                                timestamp: lastValue.x,
                                key: instance.key,
                                value: lastValue.y
                            });
                        }
                    }
                }

                return returnValues;
            };

            // create derived metric
            this.metric = latencyMetric;//MetricListService.getOrCreateDerivedMetric(this.name, derivedFunction);
            this.updateScope(this.metric.data);
        };

        DataModel.prototype.destroy = function () {
            // remove subscribers and delete derived metric
            MetricListService.destroyDerivedMetric(this.name);

            // remove subscribers and delete base metrics
            MetricListService.destroyMetric('bcc.disk.all.latency');

            WidgetDataModel.prototype.destroy.call(this);
        };

        return DataModel;
    }

    angular
        .module('datamodel')
        .factory('BccDiskLatencyMetricDataModel', BccDiskLatencyMetricDataModel);
 })();
