d3.prosConsDataManager = function module() {
  var exports = {};
  var dataList = [] // {pros:, cons:, name:}

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
  var div;
  var zippedData;
  var dataList;

  var prosColor = d3.scale.log().range(['#6c88b5', '#1a468c'])
  var consColor = d3.scale.log().range(['#fbc483', '#f9a33d'])

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

  function getZippedData(_data) {
    return d3.zip(_data[0], _data[1]);
  }

  function init(self, _data) {
    var windowWidth = Math.max(280, Math.min($('body').width(), 480))

    d3.select(self)
    .style('width', windowWidth+'px')

    if (!div) {
      div = d3.select(self).append("div")
      .attr('class', 'canvas')
    }

    var z = ['#1a468c', '#f9a33d', '#d13d30']
    var table = div.append('table')

    var target = table.append('caption')
    .append('select')
    .attr('class', 'targets')

    target.selectAll('.data_option')
      .data(dataList)
    .enter().append('option')
    .attr('value', function(d) {return name})
    .html(function(d) {return d.name})

    target.on('change', function(d) {
      draw(dataList[this.selectedIndex]);
    });

    table.append('tr').selectAll('.head')
    .data(['장점', '단점'])
    .enter().append('th')
    .attr('class', 'head')
    .html(function(d) {return d})
    .style('color', function(d,i) {return z[i]})

    draw(dataList[0]);
  }

  function draw( targetData) {
    d3.prosConsDataManager().loadJSONData(targetData.pros, targetData.cons, function(_data) {
      prosColor.domain(d3.extent(_data[0].map(function(d){return d.keyness})))
      consColor.domain(d3.extent(_data[1].map(function(d){return d.keyness})))
      var zippedData = getZippedData(_data);
      update(zippedData);
    });
  }

  function update(zippedData) {
    div.select('table').selectAll('.row').remove()

    var tr = div.select('table').selectAll('.row')
    .data(zippedData)

    tr.enter().append('tr')
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
    }).on('click', function(d,i) {
      var self = this;

      if (d3.select(this).classed('selected')) {
        div.select('table').selectAll('tr.appended').remove();
        d3.select(this).classed({'selected': false})
      }
      else if (div.select('table').selectAll('tr.appended').empty()) {
        insertTr(this)
      } else {
        div.select('table').selectAll('tr.appended').remove();
        d3.selectAll('td.selected').classed({'selected': false})
        insertTr(this);
      }

      function insertTr(self) {
        scrollToTr(self);
        // end of scroll
        d3.select(self).classed({'selected': true});
        var parentTr = d3.select(self).node().parentNode;
        var parentTrIndex = d3.select(parentTr).datum()[i].index;
        var newTr = div.select('table')
        .insert('tr', "tr.row:nth-child("+(parentTrIndex+4) + ")")
        .attr('class', 'appended')
        .on('click', function(d) {
          d3.select('ul.sentences')
          .transition().duration(400)
          .style('height', '0px')
          .each('end', function() {
            div.select('table').selectAll('tr.appended').remove();
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
    });

    td.exit().remove();

    tr.selectAll('.pros')
    .style('background-color', function(d) { return prosColor(d.keyness)})
    tr.selectAll('.cons')
    .style('background-color', function(d) { return consColor(d.keyness)})

    var keyword = td.append('span')
    .attr('class', 'keyword')
    .html(function(d) {return d.keyword})

    var keyness = td.append('span')
    .attr('class', 'keyness')
    .html(function(d) {return '('+Math.round(d.keyness)+')'})

    var arrow = td.append('span')
    .attr('class', 'arrow')
    .html(function(d) {return '▾'})


  }

  function exports(_selection) {
    _selection.each(function(_data) {
      var self = this;
      init(self, _data);
    }) // end of each
  } // end of exports


  exports.dataList = function(_dataList) {
    if(!arguments.length) {
      return dataList;
    } else {
      dataList = _dataList;
      return exports;
    }
  }

  return exports;

} // end of class scope
