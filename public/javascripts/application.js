var UNRESPONSIVE = '#888';
var FAILED       = '#c21';
var PENDING      = '#e72';
var CHANGED      = '#069';
var UNCHANGED    = '#093';
var ALL          = '#000';
var BAR_GRAPH    = '';


//graph specific variables
var graph_id             = [];
var label_data           = [];
var changed_data         = []; 
var unchanged_data       = []; 
var pending_data         = [];
var failed_data          = []; 

var changed_data_label   = [];
var unchanged_data_label = [];
var pending_data_label   = []; 
var failed_data_label    = [];


jQuery(document).ready(function(J) {

  J('table.main .status img[title]').tipsy({gravity: 's'});

  J('button.drop, a.drop').click( function(e) {
    var self = J(this);
    var all_drops = self.parents('div').find('.dropdown');
    var drop = self.next('.dropdown');

    if (drop.is(':hidden')) {
      all_drops.hide();
      drop.show();
      drop.bind('click', function(e){e.stopPropagation()});
      J(document).one('click.hideDropdown', function() {drop.hide()});
    } else {
      all_drops.hide();
    };

    return false;
  })

  J('table.main th input#check_all').click( function() {
    self = J(this);
    self.parents('table').find('td input:checkbox').attr('checked', self.is(':checked'));
  });

  J('a.in-place').click(function() {
    J(this).parents('.header').hide().next('.in-place').show().find('input[type=text]').focus();
    return false;
  });

  J.fn.mapHtml = function() { return this.map(function(){return J(this).html()}).get(); }
  J.fn.mapHtmlInt = function() { return this.map(function(){return parseInt(J(this).html())}).get(); }
  J.fn.mapHtmlFloat = function() { return this.map(function(){return parseFloat(J(this).html())}).get(); }

  //build the stacked bar graph
  init_stacked_graph(J);

  init_expandable_list();

  J('.reports_show_action #report-tabs').show();
  J('.reports_show_action .panel').addClass('tabbed');
  J('.reports_show_action #report-tabs li').click(function() {
    panelID = this.id.replace(/-tab$/, '');
    J('.reports_show_action #report-tabs li').removeClass('active');
    J('.reports_show_action .panel').hide();
    J(this).addClass('active');
    J('#' + panelID).show();
  });
  J('.reports_show_action #report-tabs li:first').click();

  J('.pages_home_action #home-tabs').show();
  J('.pages_home_action .panel').addClass('tabbed');
  J('.pages_home_action #home-tabs li').click(function() {
    panelID = this.id.replace(/-tab$/, '');
    J('.pages_home_action #home-tabs li').removeClass('active');
    J('.pages_home_action .panel').hide();
    J(this).addClass('active');
    J('#' + panelID).show();
  });
  J('.pages_home_action #home-tabs li:first').click();

  init_sidebar_links();
});

function init_stacked_graph(J) {
  
  console.log('init_stacked_graph');

  J("table.data.status").each(function(i){

    console.log('the for each happens how many times?');
    graph_id = "table_status"+i;
    J("<div id='"+graph_id+"' style='height: 150px; width: auto;'></div>").insertAfter(J(this));

    label_data = J(this).find("tr.labels th").mapHtml();
    changed_data = J(this).find("tr.changed td").mapHtmlInt();
    unchanged_data = J(this).find("tr.unchanged td").mapHtmlInt();

    pending_data = J(this).find("tr.pending td").mapHtmlInt();
    failed_data = J(this).find("tr.failed td").mapHtmlInt();


    changed_data_label = J.map(changed_data, function(item, index){return item+" changed"});
    unchanged_data_label = J.map(unchanged_data, function(item, index){return item+" unchanged"});
    pending_data_label = J.map(pending_data, function(item, index){return item+" pending"});
    failed_data_label = J.map(failed_data, function(item, index){return item+" failed"});

    //build the graph
    create_stacked_graph($(graph_id), label_data, changed_data_label, unchanged_data_label, pending_data_label, failed_data_label);
    
    J(this).hide();
  });
}

function create_stacked_graph(id, label_data, changed_data_label, unchanged_data_label, pending_data_label, failed_data_label) {
  
  console.log('--------------------------')

  console.log('GRAPH - yay the unchanged data is >> ' + [unchanged_data]);
  console.log('GRAPH - BEFORE the changed_data data is >> ' + [changed_data]);
  console.log('GRAPH - BEFORE the pending_data data is >> ' + [pending_data]);
  console.log('GRAPH - BEFORE the failed_data data is >> ' + [failed_data]);

  BAR_GRAPH = new Grafico.StackedBarGraph(id,
      {
        unchanged: jQuery('table.data.status').find("tr.unchanged td").mapHtmlInt(),
        changed: jQuery('table.data.status').find("tr.changed td").mapHtmlInt(),
        pending: jQuery('table.data.status').find("tr.pending td").mapHtmlInt(),
        failed: jQuery('table.data.status').find("tr.failed td").mapHtmlInt()
      },
      {
        colors: { pending: PENDING, changed: CHANGED, unchanged: UNCHANGED, failed: FAILED },
        datalabels: { changed: changed_data_label, unchanged: unchanged_data_label, pending: pending_data_label, failed: failed_data_label },
        font_size: 9,
        grid: false,
        label_color: '#666',
        label_rotation: -30,
        labels: label_data,
        padding_top: 10,
        left_padding: 50,
        show_ticks: false
      }
    );

    console.log('--------------------------')

    console.log('GRAPH - AFTER the unchanged data is >> ' + jQuery('table.data.status').find("tr.unchanged td").mapHtmlInt());
    console.log('GRAPH - AFTER the changed_data data is >> ' + [changed_data]);
    console.log('GRAPH - AFTER the pending_data data is >> ' + [pending_data]);
    console.log('GRAPH - AFTER the failed_data data is >> ' + [failed_data]);
} 

function init_expandable_list() {
  jQuery( '.expand-all' ).live( 'click', function() {
    jQuery('.expandable-link.collapsed-link').each(toggle_expandable_link);
    return false;
  });
  jQuery( '.collapse-all' ).live( 'click', function() {
    jQuery('.expandable-link').not('.collapsed-link').each(toggle_expandable_link);
    return false;
  });
  jQuery( '.expandable-link' ).live( 'click', function() {
    toggle_expandable_link.call(this);
    return false;
  });
}

function toggle_expandable_link() {
  expansionTime = 30; // ms
  jQuery(this).toggleClass('collapsed-link');
  jQuery(this.id.replace('expand', '#expandable'))
    .toggle('blind', {}, expansionTime);
  if (jQuery(this).hasClass('collapsed-link')) {
    if (jQuery('.expandable-link').not('.collapsed-link').size() == 0) {
      var old_text = jQuery('.collapse-all').text();
      jQuery('.collapse-all')
        .removeClass( 'collapse-all' )
        .addClass( 'expand-all' )
        .text( old_text.replace( 'collapse', 'expand' ));
    }
  } else {
    if (jQuery('.expandable-link.collapsed-link').size() == 0) {
      var old_text = jQuery('.expand-all').text();
      jQuery('.expand-all')
        .removeClass( 'expand-all' )
        .addClass( 'collapse-all' )
        .text( old_text.replace( 'expand', 'collapse' ));
    }
  }
}

function display_file_popup(url) {
    jQuery.colorbox({href: url, width: '80%', height: '80%', iframe: true});
}

function init_sidebar_links() {
  jQuery( '.node_summary .primary tr' ).each( function() {
    jQuery( this )
      .hover(
        function() {
          jQuery( this ).addClass( 'hover' );
        },
        function() {
          jQuery( this ).removeClass( 'hover' );
        }
      )
      .click( function() {
        var url = jQuery( this ).find( '.count a' ).attr( 'href' );
        document.location.href = url;
        return false;
      });
  });
}

jQuery(window).resize(function(){

  //resize and redraw the graphs based on the window's updated dimensions

  //BAR_GRAPH.paper.remove();

  //this is working, but needs help
  //BAR_GRAPH.paper.canvas["setAttribute"]("viewBox", "0 0 500 500"); 

  console.log('--------------------------')

  //create_stacked_graph($(graph_id), label_data, changed_data_label, unchanged_data_label, pending_data_label, failed_data_label);

});