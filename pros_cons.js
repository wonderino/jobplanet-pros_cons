d3.prosConsDataManager = function module() {
  var exports = {};
  var dataList = [] // {pros:, cons:, name:}

  exports.dataList = function(_dataList) {
    if(!arguments.length) {
      return dataList;
    } else {
      dataList = _dataList;
    }
  }

  exports.loadJSONData = function(_prosPath, _consPath, _callback) {
    function type(data) {
      data.forEach(function(d,i) {
        if (d.pos.indexOf('V') == 0) {
          d.keyword += '다';
        }
        d.index = i;
      })
    }
    d3.json(_prosPath, function(_err, _prosData) {
        type(_prosData);
        d3.json(_consPath, function(_err, _consData) {
          type(_consData);
          _callback([_prosData, _consData]);
        })
    });
  }
  return exports
}

d3.prosCons = function module() {
  var windowWidth;
  var margin = {top: 20, right: 10, bottom: 20, left: 10};
  var svg;
  var zippedData;
  var label;
  var dataListMap;

  function scrollToTr(self) {
    var dist = d3.select(self).node()
    .getBoundingClientRect().top
    + (window.pageYOffset || document.documentElement.scrollTop) ;
    var offset = function (offset) {
      return function() {
        var fromTo = [window.pageYOffset || document.documentElement.scrollTop, offset];
        var i = d3.interpolateNumber(fromTo[0], fromTo[1])
        return function(t) {scrollTo(0, i(t)); };
      }
    }
    d3.transition()
    .duration(800)
    .tween('scroll', offset(dist))
  }

  function exports(_selection) {
    _selection.each(function(_data) {
      var self = this;
      var windowWidth = Math.max(280, Math.min($('body').width(), 480))
      var div;
      d3.select(self)
        .style('width', windowWidth+'px')

      if (!div) {
        div = d3.select(self).append("div")
        .attr('class', 'canvas')
      }

      zippedData = d3.zip(_data[0], _data[1])
      var z = ['#1a468c', '#f9a33d', '#d13d30']

      var prosColor = d3.scale.log()
        .domain(d3.extent(_data[0].map(function(d){return d.keyness})))
        .range(['#6c88b5', '#1a468c'])
      var consColor = d3.scale.log()
        .domain(d3.extent(_data[1].map(function(d){return d.keyness})))
        .range(['#fbc483', '#f9a33d'])

      var table = div.append('table').attr('class', 'table')

      table.selectAll('.target')
        .data([label])
      .enter().append('caption')
      .attr('class', 'target')
      .html(function(d) {return d;})

      table.append('tr').selectAll('.head')
        .data(['장점', '단점'])
      .enter().append('th')
      .attr('class', 'head')
      .html(function(d) {return d})
      .style('color', function(d,i) {return z[i]})

      var tr = table.selectAll('.row')
        .data(zippedData)
      .enter().append('tr')
      .attr('class', 'row')


      var td = tr.selectAll('.col')
        .data(function(d){return d})

      td.enter().append('td')
      .classed({'col': true})
      .classed('pros', function(d,i) {
        if (i==0) return true;
        else false;
      })
      .classed('cons', function(d,i) {
        if (i==1) return true;
        else false;
      })

      tr.selectAll('.pros')
        .style('background-color', function(d) { return prosColor(d.keyness)})

      tr.selectAll('.cons')
        .style('background-color', function(d) { return consColor(d.keyness)})

      td.append('span')
        .attr('class', 'keyword')
        .html(function(d) {return d.keyword})

      td.append('span')
        .attr('class', 'keyness')
        .html(function(d) {return '('+Math.round(d.keyness)+')'})

      td.append('span')
        .attr('class', 'arrow')
        .html(function(d) {return '▾'})

      td.on('click', function(d,i) {
        var self = this;

        if (d3.select(this).classed('selected')) {
          table.selectAll('tr.appended').remove();
          d3.select(this).classed({'selected': false})
        }
        else if (table.selectAll('tr.appended').empty()) {
          insertTr(this)
        } else {
          table.selectAll('tr.appended').remove();
          d3.selectAll('td.selected').classed({'selected': false})
          insertTr(this);
        }

        function insertTr(self) {
          scrollToTr(self);
          // end of scroll
          d3.select(self).classed({'selected': true});
          var parentTr = d3.select(self).node().parentNode;
          var parentTrIndex = d3.select(parentTr).datum()[i].index;
          var newTr = table
            .insert('tr', "tr.row:nth-child("+(parentTrIndex+4) + ")")
            .attr('class', 'appended')
            .on('click', function(d) {
              d3.select('ul.sentences')
              .transition().duration(400)
              .style('height', '0px')
              .each('end', function() {
                table.selectAll('tr.appended').remove();
                d3.select(self).classed({'selected': false})
              });
              //scrollToTr(self);
            })

          var ul = newTr.append('td')
          .attr('colspan', 2)
          .append('ul')
          .attr('class', 'sentences')

          ul.transition()
          .duration(400)
          .style('height', '400px')

          ul.selectAll('.sentence')
          .data(d.sentences)
          .enter().append('li')
          .attr('class', 'sentence')
          .html(function(d) {return '"' + d +'"';})
        }
      })
    }) // end of each
  } // end of exports

  exports.label = function(_label) {
    if (!arguments.length) {
      return label;
    } else {
      label = _label;
    }
  }

  exports.dataListMap = function(_dataListMap) {

  }

  return exports;



} // end of class scope
