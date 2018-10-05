/**
 * Utility functions.
 */

jsondash = jsondash || {util: {}};

jsondash.util.getCSSClasses = function(conf, defaults) {
    var classes = {};
    if(conf.classes === undefined && defaults !== undefined) {
        $.each(defaults, function(i, klass){
            classes[klass] = true;
        });
        return classes;
    }
    if(conf.classes !== undefined) {
        $.each(conf.classes, function(i, klass){
            classes[klass] = true;
        });
    }
    return classes;
};

jsondash.util.getValidParamString = function(arr) {
    // Jquery $.serialize and $.serializeArray will
    // return empty query parameters, which is undesirable and can
    // be error prone for RESTFUL endpoints.
    // e.g. `foo=bar&bar=` becomes `foo=bar`
    var param_str = '';
    arr = arr.filter(function(param, i){return param.value !== '';});
    $.each(arr, function(i, param){
        param_str += (param.name + '=' + param.value);
        if(i < arr.length - 1 && arr.length > 1) param_str += '&';
    });
    return param_str;
};

/**
 * [reformatQueryParams Reformat params into a query string.]
 * @param  {[type]} old [List of query params]
 * @param  {[type]} new [List of query params]
 * @return {[type]}     [The new string (e.g. 'foo=bar&baz=1')]
        For example:
        old: foo=1&baz=1
        new: foo=2&quux=1
        expected: foo=2&quux=1&baz=1
 */
jsondash.util.reformatQueryParams = function(oldp, newp) {
    var _combined = {};
    var combined  = '';
    var oldparams = {};
    var newparams = {};
    $.each(oldp ? oldp.split('&'): [], function(i, param){
        param = param.split('=');
        oldparams[param[0]] = param[1];
    });
    $.each(newp ? newp.split('&'): [], function(i, param){
        param = param.split('=');
        newparams[param[0]] = param[1];
    });
    _combined = $.extend(oldparams, newparams);
    $.each(_combined, function(k, v){
        if(v !== undefined) {
            combined += k + '=' + v + '&';
        }
    });
    // Replace last ampersan if it exists.
    if(combined.charAt(combined.length - 1) === '&') {
        return combined.substring(0, combined.length - 1);
    }
    return combined;
};

/**
 * [isInDemoMode Check if app is in demo mode.]
 */
jsondash.util.isInDemoMode = function() {
    var parts = window.location.href.split('?');
    var matches = parts.filter(function(part, _){
        return part === 'jsondash_demo_mode=1' || part === 'jsondash_demo_mode=true';
    });
    return matches.length > 0;
};

/**
 * [intervalStrToMS Convert a string formatted to indicate an interval to milliseconds]
 * @param  {[String]} ival_fmt [The interval format string e.g. "1-d", "2-h"]
 * @return {[Number]} [The number of milliseconds]
 */
jsondash.util.intervalStrToMS = function(ival_fmt) {
    if(ival_fmt === undefined || ival_fmt === '') {
        return null;
    }
    // Just return number if it's a regular integer.
    if(!isNaN(ival_fmt)) {
        return ival_fmt;
    }
    var pieces = ival_fmt.split('-');
    var amt = parseInt(pieces[0], 10);
    if(pieces.length !== 2 || isNaN(amt) || amt === 0) {
        // Force NO value if the format is invalid.
        // This would be used to ensure the interval
        // is not set in the first place.
        return null;
    }
    var ival = pieces[1].toLowerCase();
    var ms2s = 1000;
    var ms2min = 60 * ms2s;
    var ms2hr = 60 * ms2min;
    var ms2day = 24 * ms2hr;

    // Seconds
    if(ival === 's') {
        return amt * ms2s;
    }
    // Minutes
    if(ival === 'm') {
        return amt * ms2min;
    }
    // Hours
    if(ival === 'h') {
        return amt * ms2hr;
    }
    // Days
    if(ival === 'd') {
        return amt * ms2day;
    }
    // Anything else is invalid.
    return null;
};

jsondash.util.serializeToJSON = function(arr) {
    // Convert form data to a proper json value
    var json = {};
    $.each(arr, function(_, pair){
        json[pair.name] = pair.value;
    });
    return json;
};

jsondash.util.isOverride = function(config) {
    return config.override && config.override === true;
};

// Credit: http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
jsondash.util.s4 = function() {
    return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
};

jsondash.util.guid = function() {
    var s4 = jsondash.util.s4;
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
};

jsondash.util.polygon = function(d) {
    return "M" + d.join("L") + "Z";
};

jsondash.util.scaleStr = function(x, y) {
    return 'scale(' + x + ',' + y + ')';
};

jsondash.util.translateStr = function(x, y) {
    return 'translate(' + x + ',' + y + ')';
};

/**
 * [getDigitSize return a d3 scale for adjusting font size based
 *     on digits and width of container.]
 */
jsondash.util.getDigitSize = function() {
    // scale value is reversed, since we want
    // the font-size to get smaller as the number gets longer.
    var scale = d3.scale.linear()
        .clamp(true)
        .domain([2, 14]) // min/max digits length: $0 - $999,999,999.00
        .range([90, 30]); // max/min font-size
    return scale;
};


/**
 * [applyMapping read the config, and apply the proxyMapping if needed.
 */
jsondash.util.getPickingList = function(configType) {
    var pickingList;
    switch (configType) {
        case 'timeseries':
            pickingList = {
                dates: { instructions: '.dates', strategy: 'date' },
                labels: { instructions: '.@labels', strategy: 'label' },
                values: { instructions: '.@labels.@@dates', strategy: 'value' }
            };
            break;
        default:
            pickingList = {
                labels: { instructions: '.@labels', strategy: 'label' },
                values: { instructions: '.@>labels.', strategy: 'value' }
            };
    }
    return pickingList;
}


/**
 * [applyMapping read the config, and apply the proxyMapping if needed.
 */
jsondash.util.applyMapping = function(config, data) {
    var result = {
        error: false,
        data: {}
    }

    // functions
    var mappingFun = config.proxyMappingFun;
    var mapFunctions = {};
    for (var k in mappingFun) {
        var funT = mappingFun[k];
        mapFunctions[k] = new Function('value', 'datum', funT);
    }
    
    var pickingList = jsondash.util.getPickingList(config);
    switch (config.type) {
        case 'timeseries':
            mapFunctions.dates = new Function('value', 'datum', 'var d=new Date(value*1000); return d.toISOString().split("T")[0];');
            break;
        default:
    }

    // mapping
    var mapping = config.proxyMapping;
    if (mapping !== undefined && mapping !== null && typeof mapping !== "string" && Object.keys(mapping).length > 0) {
        var options = {
            fillValue: 0,
            functions: mapFunctions
        };
        var mappedData = new $.proxyMapper(mapping, pickingList, data, options);
        result.data = mappedData;
    } else if (typeof mapping === "string") { // mapping function overwrite
        var options = {
            overwriteMappingFunction: mapping
        };
        var mappedData = new $.proxyMapper({}, pickingList, data, options);
        result.data = mappedData;
    } else { // verify format
        result.data = data;
        if (data.dates !== undefined && data.dates.length > 0 && data.length > 1) {
            // all fine, proceed to the ploting
        } else {
            result.error = {};
            result.error.status = false;
            result.error.statusText = 'Input data does not match expected format.';
        }
    }

    return result;
}

/**
 * [quickModal create a modal, open it and destroy it on closing
 */
jsondash.util.quickModal = function(header, body, options, callbackFun) {
    switch (options.size) {
        case 'sm':
            size = 'modal-sm';
            break;
        case 'md':
            size = '';
            break;
        case 'lg':
            size = 'modal-lg';
            break;
        case 'xl':
            size = 'modal-xl';
            break;
        case 'xxl':
            size = 'modal-xxl';
            break;
        default:
            size = '';
    }
    var modalId = 'quickmodal-' + jsondash.util.s4();
    var html =  '<div id="'+modalId+'" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="confirm-modal" aria-hidden="true">';
        html += '<div class="modal-dialog '+size+'">';
            html += '<div class="modal-content">';
                html += '<div class="modal-header">';
                    html += '<a class="close" data-dismiss="modal">×</a>';
                    html += '<h4>'+header+'</h4>'
                html += '</div>';
                html += '<div class="modal-body">';
                    html += body;
                html += '</div>';
                html += '<div class="modal-footer">';
                    html += '<span class="btn btn-success" data-dismiss="modal">Save</span>';
                    html += '<span class="btn btn-primary" data-dismiss="modal">Close</span>';
                html += '</div>';
            html += '</div>';
        html += '</div>';
    html += '</div>';
    $('body').append(html);
    jModal = $('#'+modalId);
    jModal.modal();
    jModal.modal('show');

    jModal.on('hidden.bs.modal', function (e) {
        $(this).remove();
    });
    if (callbackFun !== undefined) {
        var btn = jModal.find('.btn-success');
        btn.click(function(e) {
            var modal = $(e.target).parent().parent();
            callbackFun(e, modal);
        })
    }
    return jModal;
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = jsondash;
}
