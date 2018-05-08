'use strict';

// polyfill required for PhantomJS
// source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
if (!Array.prototype.fill) {
    Object.defineProperty(Array.prototype, 'fill', {
        value: function(value) {

        // Steps 1-2.
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }

        var O = Object(this);

        // Steps 3-5.
        var len = O.length >>> 0;

        // Steps 6-7.
        var start = arguments[1];
        var relativeStart = start >> 0;

        // Step 8.
        var k = relativeStart < 0 ?
            Math.max(len + relativeStart, 0) :
            Math.min(relativeStart, len);

        // Steps 9-10.
        var end = arguments[2];
        var relativeEnd = end === undefined ?
            len : end >> 0;

        // Step 11.
        var final = relativeEnd < 0 ?
            Math.max(len + relativeEnd, 0) :
            Math.min(relativeEnd, len);

        // Step 12.
        while (k < final) {
            O[k] = value;
            k++;
        }

        // Step 13.
        return O;
        }
    });
}

describe('Service: Heatmap', function() {

    beforeEach(module('heatmap'));

    var $rootScope, HeatmapService;

    beforeEach(inject(function(_$rootScope_, _HeatmapService_){
        $rootScope = _$rootScope_;
        HeatmapService = _HeatmapService_;
    }));

    it('should parse heatmap data', function() {
        $rootScope.properties = {
            interval: 2,
            window: 14/60
        };

        var rawData = [
            {"key":"0-1","values":[
                {"x":1525791275151.992,"y":0},
                {"x":1525791275152.992,"y":0},
                {"x":1525791277175.622,"y":0},
                {"x":1525791279159.262,"y":0},
                {"x":1525791281157.147,"y":0},
                {"x":1525791283163.355,"y":0}
            ]},
            {"key":"2-3","values":[
                {"x":1525791275151.992,"y":0},
                {"x":1525791275152.992,"y":0},
                {"x":1525791277175.622,"y":0},
                {"x":1525791279159.262,"y":0},
                {"x":1525791281157.147,"y":0},
                {"x":1525791283163.355,"y":2}
            ]},
            {"key":"4-7","values":[
                {"x":1525791275151.992,"y":0},
                {"x":1525791275152.992,"y":0},
                {"x":1525791277175.622,"y":1},
                {"x":1525791279159.262,"y":0},
                {"x":1525791281157.147,"y":0},
                {"x":1525791283163.355,"y":3}
            ]}
        ];

        var hmData = HeatmapService.generate(rawData);
        expect(hmData.rows).toEqual([7, 3, 1]);
        expect(hmData.columns).toEqual([1525791271, 1525791273, 1525791275, 1525791277, 1525791279, 1525791281, 1525791283]);
        expect(hmData.values).toEqual([
            [null, null, null],
            [null, null, null],
            [0, 0, 0],
            [2, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [6, 4, 0]
        ]);
    });

    it('should parse heatmap data with updated interval', function() {
        $rootScope.properties = {
            interval: 4,
            window: 14/60
        };

        var rawData = [
            {"key":"0-1","values":[
                {"x":1525791275151.992,"y":0},
                {"x":1525791275152.992,"y":0},
                {"x":1525791277175.622,"y":0},
                {"x":1525791279159.262,"y":0},
                {"x":1525791281157.147,"y":0},
                {"x":1525791283163.355,"y":0}
            ]},
            {"key":"2-3","values":[
                {"x":1525791275151.992,"y":0},
                {"x":1525791275152.992,"y":0},
                {"x":1525791277175.622,"y":0},
                {"x":1525791279159.262,"y":0},
                {"x":1525791281157.147,"y":0},
                {"x":1525791283163.355,"y":2}
            ]},
            {"key":"4-7","values":[
                {"x":1525791275151.992,"y":0}, // n-2 col
                {"x":1525791275152.992,"y":0}, // n-2 col
                {"x":1525791277175.622,"y":2}, // last but one col
                {"x":1525791279159.262,"y":5}, // last but one col
                {"x":1525791281157.147,"y":1}, // last col
                {"x":1525791283163.355,"y":3}  // last col
            ]}
        ];

        var hmData = HeatmapService.generate(rawData);
        expect(hmData.rows).toEqual([7, 3, 1]);
        expect(hmData.columns).toEqual([1525791271, 1525791275, 1525791279, 1525791283]);
        expect(hmData.values).toEqual([
            [null, null, null],
            [0, 0, 0],
            [28, 0, 0],
            [16, 8, 0]
        ]);
    });

});